"use strict";
/* eslint-disable require-atomic-updates */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_extra_1 = require("fs-extra");
const minimist_1 = __importDefault(require("minimist"));
const pkg_fetch_1 = require("pkg-fetch");
const path_1 = __importDefault(require("path"));
const log_1 = require("./log");
const help_1 = __importDefault(require("./help"));
const common_1 = require("./common");
const packer_1 = __importDefault(require("./packer"));
const chmod_1 = require("./chmod");
const producer_1 = __importDefault(require("./producer"));
const refiner_1 = __importDefault(require("./refiner"));
const fabricator_1 = require("./fabricator");
const walker_1 = __importDefault(require("./walker"));
const compress_type_1 = require("./compress_type");
const mach_o_1 = require("./mach-o");
const { version } = JSON.parse((0, fs_extra_1.readFileSync)(path_1.default.join(__dirname, '../package.json'), 'utf-8'));
function isConfiguration(file) {
    return (0, common_1.isPackageJson)(file) || file.endsWith('.config.json');
}
// http://www.openwall.com/lists/musl/2012/12/08/4
const { hostArch, hostPlatform, isValidNodeRange, knownArchs, knownPlatforms, toFancyArch, toFancyPlatform, } = pkg_fetch_1.system;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const hostNodeRange = `node${process.version.match(/^v(\d+)/)[1]}`;
function parseTargets(items) {
    // [ 'node6-macos-x64', 'node6-linux-x64' ]
    const targets = [];
    for (const item of items) {
        const target = {
            nodeRange: hostNodeRange,
            platform: hostPlatform,
            arch: hostArch,
        };
        if (item !== 'host') {
            for (const token of item.split('-')) {
                if (!token) {
                    continue;
                }
                if (isValidNodeRange(token)) {
                    target.nodeRange = token;
                    continue;
                }
                const p = toFancyPlatform(token);
                if (knownPlatforms.indexOf(p) >= 0) {
                    target.platform = p;
                    continue;
                }
                const a = toFancyArch(token);
                if (knownArchs.indexOf(a) >= 0) {
                    target.arch = a;
                    continue;
                }
                throw (0, log_1.wasReported)(`Unknown token '${token}' in '${item}'`);
            }
        }
        targets.push(target);
    }
    return targets;
}
function stringifyTarget(target) {
    const { nodeRange, platform, arch } = target;
    return `${nodeRange}-${platform}-${arch}`;
}
function differentParts(targets) {
    const nodeRanges = {};
    const platforms = {};
    const archs = {};
    for (const target of targets) {
        nodeRanges[target.nodeRange] = true;
        platforms[target.platform] = true;
        archs[target.arch] = true;
    }
    const result = {};
    if (Object.keys(nodeRanges).length > 1) {
        result.nodeRange = true;
    }
    if (Object.keys(platforms).length > 1) {
        result.platform = true;
    }
    if (Object.keys(archs).length > 1) {
        result.arch = true;
    }
    return result;
}
function stringifyTargetForOutput(output, target, different) {
    const a = [output];
    if (different.nodeRange) {
        a.push(target.nodeRange);
    }
    if (different.platform) {
        a.push(target.platform);
    }
    if (different.arch) {
        a.push(target.arch);
    }
    return a.join('-');
}
function fabricatorForTarget({ nodeRange, arch }) {
    let fabPlatform = hostPlatform;
    if (hostArch !== arch &&
        (hostPlatform === 'linux' || hostPlatform === 'alpine')) {
        // With linuxstatic, it is possible to generate bytecode for different
        // arch with simple QEMU configuration instead of the entire sysroot.
        fabPlatform = 'linuxstatic';
    }
    return {
        nodeRange,
        platform: fabPlatform,
        arch,
    };
}
const dryRunResults = {};
async function needWithDryRun({ forceBuild, nodeRange, platform, arch, }) {
    const result = await (0, pkg_fetch_1.need)({
        dryRun: true,
        forceBuild,
        nodeRange,
        platform,
        arch,
    });
    (0, assert_1.default)(['exists', 'fetched', 'built'].indexOf(result) >= 0);
    dryRunResults[result] = true;
}
const targetsCache = {};
async function needViaCache(target) {
    const s = stringifyTarget(target);
    let c = targetsCache[s];
    if (c) {
        return c;
    }
    const { forceBuild, nodeRange, platform, arch } = target;
    c = await (0, pkg_fetch_1.need)({
        forceBuild,
        nodeRange,
        platform,
        arch,
    });
    targetsCache[s] = c;
    return c;
}
async function exec(argv2) {
    var _a, _b;
    const argv = (0, minimist_1.default)(argv2, {
        boolean: [
            'b',
            'build',
            'bytecode',
            'native-build',
            'd',
            'debug',
            'h',
            'help',
            'public',
            'v',
            'version',
        ],
        string: [
            '_',
            'c',
            'config',
            'o',
            'options',
            'output',
            'outdir',
            'out-dir',
            'out-path',
            'public-packages',
            'no-dict',
            't',
            'target',
            'targets',
            'C',
            'compress',
        ],
        default: { bytecode: true, 'native-build': true },
    });
    if (argv.h || argv.help) {
        (0, help_1.default)();
        return;
    }
    // version
    if (argv.v || argv.version) {
        // eslint-disable-next-line no-console
        console.log(version);
        return;
    }
    log_1.log.info(`pkg@${version}`);
    // debug
    log_1.log.debugMode = argv.d || argv.debug;
    // forceBuild
    const forceBuild = argv.b || argv.build;
    // doCompress
    const algo = argv.C || argv.compress || 'None';
    let doCompress = compress_type_1.CompressType.None;
    switch (algo.toLowerCase()) {
        case 'brotli':
        case 'br':
            doCompress = compress_type_1.CompressType.Brotli;
            break;
        case 'gzip':
        case 'gz':
            doCompress = compress_type_1.CompressType.GZip;
            break;
        case 'none':
            break;
        default:
            throw (0, log_1.wasReported)(`Invalid compression algorithm ${algo} ( should be None, Brotli or Gzip)`);
    }
    if (doCompress !== compress_type_1.CompressType.None) {
        // eslint-disable-next-line no-console
        console.log('compression: ', compress_type_1.CompressType[doCompress]);
    }
    // _
    if (!argv._.length) {
        throw (0, log_1.wasReported)('Entry file/directory is expected', [
            'Pass --help to see usage information',
        ]);
    }
    if (argv._.length > 1) {
        throw (0, log_1.wasReported)('Not more than one entry file/directory is expected');
    }
    // input
    let input = path_1.default.resolve(argv._[0]);
    if (!(0, fs_extra_1.existsSync)(input)) {
        throw (0, log_1.wasReported)('Input file does not exist', [input]);
    }
    if ((await (0, fs_extra_1.stat)(input)).isDirectory()) {
        input = path_1.default.join(input, 'package.json');
        if (!(0, fs_extra_1.existsSync)(input)) {
            throw (0, log_1.wasReported)('Input file does not exist', [input]);
        }
    }
    // inputJson
    let inputJson;
    let inputJsonName;
    if (isConfiguration(input)) {
        inputJson = JSON.parse(await (0, fs_extra_1.readFile)(input, 'utf-8'));
        inputJsonName = inputJson.name;
        if (inputJsonName) {
            inputJsonName = inputJsonName.split('/').pop(); // @org/foo
        }
    }
    // inputBin
    let inputBin;
    if (inputJson) {
        let { bin } = inputJson;
        if (bin) {
            if (typeof bin === 'object') {
                if (bin[inputJsonName]) {
                    bin = bin[inputJsonName];
                }
                else {
                    bin = bin[Object.keys(bin)[0]]; // TODO multiple inputs to pkg them all?
                }
            }
            inputBin = path_1.default.resolve(path_1.default.dirname(input), bin);
            if (!(0, fs_extra_1.existsSync)(inputBin)) {
                throw (0, log_1.wasReported)('Bin file does not exist (taken from package.json ' +
                    "'bin' property)", [inputBin]);
            }
        }
    }
    if (inputJson && !inputBin) {
        throw (0, log_1.wasReported)("Property 'bin' does not exist in", [input]);
    }
    // inputFin
    const inputFin = inputBin || input;
    // config
    let config = argv.c || argv.config;
    if (inputJson && config) {
        throw (0, log_1.wasReported)("Specify either 'package.json' or config. Not both");
    }
    // configJson
    let configJson;
    if (config) {
        config = path_1.default.resolve(config);
        if (!(0, fs_extra_1.existsSync)(config)) {
            throw (0, log_1.wasReported)('Config file does not exist', [config]);
        }
        // eslint-disable-next-line import/no-dynamic-require, global-require
        configJson = require(config); // may be either json or js
        if (!configJson.name &&
            !configJson.files &&
            !configJson.dependencies &&
            !configJson.pkg) {
            // package.json not detected
            configJson = { pkg: configJson };
        }
    }
    // output, outputPath
    let output = argv.o || argv.output;
    let outputPath = argv['out-path'] || argv.outdir || argv['out-dir'];
    let autoOutput = false;
    if (output && outputPath) {
        throw (0, log_1.wasReported)("Specify either 'output' or 'out-path'. Not both");
    }
    if (!output) {
        let name;
        if (inputJson) {
            name = inputJsonName;
            if (!name) {
                throw (0, log_1.wasReported)("Property 'name' does not exist in", [argv._[0]]);
            }
        }
        else if (configJson) {
            name = configJson.name;
        }
        if (!name) {
            name = path_1.default.basename(inputFin);
        }
        if (!outputPath) {
            if (inputJson && inputJson.pkg) {
                outputPath = inputJson.pkg.outputPath;
            }
            else if (configJson && configJson.pkg) {
                outputPath = configJson.pkg.outputPath;
            }
            outputPath = outputPath || '';
        }
        autoOutput = true;
        const ext = path_1.default.extname(name);
        output = name.slice(0, -ext.length || undefined);
        output = path_1.default.resolve(outputPath || '', output);
    }
    else {
        output = path_1.default.resolve(output);
    }
    // targets
    const sTargets = argv.t || argv.target || argv.targets || '';
    if (typeof sTargets !== 'string') {
        throw (0, log_1.wasReported)(`Something is wrong near ${JSON.stringify(sTargets)}`);
    }
    let targets = parseTargets(sTargets.split(',').filter((t) => t));
    if (!targets.length) {
        let jsonTargets;
        if (inputJson && inputJson.pkg) {
            jsonTargets = inputJson.pkg.targets;
        }
        else if (configJson && configJson.pkg) {
            jsonTargets = configJson.pkg.targets;
        }
        if (jsonTargets) {
            targets = parseTargets(jsonTargets);
        }
    }
    if (!targets.length) {
        if (!autoOutput) {
            targets = parseTargets(['host']);
            (0, assert_1.default)(targets.length === 1);
        }
        else {
            targets = parseTargets(['linux', 'macos', 'win']);
        }
        log_1.log.info('Targets not specified. Assuming:', `${targets.map((t) => stringifyTarget(t)).join(', ')}`);
    }
    // differentParts
    const different = differentParts(targets);
    // targets[].output
    for (const target of targets) {
        let file;
        if (targets.length === 1) {
            file = output;
        }
        else {
            file = stringifyTargetForOutput(output, target, different);
        }
        if (target.platform === 'win' && path_1.default.extname(file) !== '.exe') {
            file += '.exe';
        }
        target.output = file;
    }
    // bakes
    const bakes = (argv.options || '')
        .split(',')
        .filter((bake) => bake)
        .map((bake) => `--${bake}`);
    // check if input is going
    // to be overwritten by output
    for (const target of targets) {
        if (target.output === inputFin) {
            if (autoOutput) {
                target.output += `-${target.platform}`;
            }
            else {
                throw (0, log_1.wasReported)('Refusing to overwrite input file', [inputFin]);
            }
        }
    }
    // fetch targets
    const { bytecode } = argv;
    const nativeBuild = argv['native-build'];
    for (const target of targets) {
        target.forceBuild = forceBuild;
        await needWithDryRun(target);
        target.fabricator = fabricatorForTarget(target);
        if (bytecode) {
            await needWithDryRun(Object.assign(Object.assign({}, target.fabricator), { forceBuild }));
        }
    }
    if (dryRunResults.fetched && !dryRunResults.built) {
        log_1.log.info('Fetching base Node.js binaries to PKG_CACHE_PATH');
    }
    for (const target of targets) {
        target.binaryPath = await needViaCache(target);
        const f = target.fabricator;
        if (f && bytecode) {
            f.binaryPath = await needViaCache(f);
            if (f.platform === 'macos') {
                // ad-hoc sign the base binary temporarily to generate bytecode
                // due to the new mandatory signing requirement
                const signedBinaryPath = `${f.binaryPath}-signed`;
                await (0, fs_extra_1.remove)(signedBinaryPath);
                (0, fs_extra_1.copyFileSync)(f.binaryPath, signedBinaryPath);
                try {
                    (0, mach_o_1.signMachOExecutable)(signedBinaryPath);
                }
                catch (_c) {
                    throw (0, log_1.wasReported)('Cannot generate bytecode', [
                        'pkg fails to run "codesign" utility. Due to the mandatory signing',
                        'requirement of macOS, executables must be signed. Please ensure the',
                        'utility is installed and properly configured.',
                    ]);
                }
                f.binaryPath = signedBinaryPath;
            }
            if (f.platform !== 'win') {
                await (0, chmod_1.plusx)(f.binaryPath);
            }
        }
    }
    // marker
    let marker;
    if (configJson) {
        marker = {
            config: configJson,
            base: path_1.default.dirname(config),
            configPath: config,
        };
    }
    else {
        marker = {
            config: inputJson || {},
            base: path_1.default.dirname(input),
            configPath: input,
        };
    }
    marker.toplevel = true;
    // public
    const params = {};
    if (argv.public) {
        params.publicToplevel = true;
    }
    if (argv['public-packages']) {
        params.publicPackages = argv['public-packages'].split(',');
        if (((_a = params.publicPackages) === null || _a === void 0 ? void 0 : _a.indexOf('*')) !== -1) {
            params.publicPackages = ['*'];
        }
    }
    if (argv['no-dict']) {
        params.noDictionary = argv['no-dict'].split(',');
        if (((_b = params.noDictionary) === null || _b === void 0 ? void 0 : _b.indexOf('*')) !== -1) {
            params.noDictionary = ['*'];
        }
    }
    // records
    let records;
    let entrypoint = inputFin;
    let symLinks;
    const addition = isConfiguration(input) ? input : undefined;
    const walkResult = await (0, walker_1.default)(marker, entrypoint, addition, params);
    entrypoint = walkResult.entrypoint;
    records = walkResult.records;
    symLinks = walkResult.symLinks;
    const refineResult = (0, refiner_1.default)(records, entrypoint, symLinks);
    entrypoint = refineResult.entrypoint;
    records = refineResult.records;
    symLinks = refineResult.symLinks;
    const backpack = (0, packer_1.default)({ records, entrypoint, bytecode, symLinks });
    log_1.log.debug('Targets:', JSON.stringify(targets, null, 2));
    for (const target of targets) {
        if (target.output && (0, fs_extra_1.existsSync)(target.output)) {
            if ((await (0, fs_extra_1.stat)(target.output)).isFile()) {
                await (0, fs_extra_1.remove)(target.output);
            }
            else {
                throw (0, log_1.wasReported)('Refusing to overwrite non-file output', [
                    target.output,
                ]);
            }
        }
        else if (target.output) {
            await (0, fs_extra_1.mkdirp)(path_1.default.dirname(target.output));
        }
        await (0, producer_1.default)({
            backpack,
            bakes,
            slash: target.platform === 'win' ? '\\' : '/',
            target: target,
            symLinks,
            doCompress,
            nativeBuild,
        });
        if (target.platform !== 'win' && target.output) {
            if (target.platform === 'macos') {
                // patch executable to allow code signing
                const buf = (0, mach_o_1.patchMachOExecutable)((0, fs_extra_1.readFileSync)(target.output));
                (0, fs_extra_1.writeFileSync)(target.output, buf);
                try {
                    // sign executable ad-hoc to workaround the new mandatory signing requirement
                    // users can always replace the signature if necessary
                    (0, mach_o_1.signMachOExecutable)(target.output);
                }
                catch (_d) {
                    if (target.arch === 'arm64') {
                        log_1.log.warn('Unable to sign the macOS executable', [
                            'Due to the mandatory code signing requirement, before the',
                            'executable is distributed to end users, it must be signed.',
                            'Otherwise, it will be immediately killed by kernel on launch.',
                            'An ad-hoc signature is sufficient.',
                            'To do that, run pkg on a Mac, or transfer the executable to a Mac',
                            'and run "codesign --sign - <executable>", or (if you use Linux)',
                            'install "ldid" utility to PATH and then run pkg again',
                        ]);
                    }
                }
            }
            await (0, chmod_1.plusx)(target.output);
        }
    }
    (0, fabricator_1.shutdown)();
}
exports.exec = exec;
//# sourceMappingURL=index.js.map