"use strict";
/* eslint-disable require-atomic-updates */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const is_core_module_1 = __importDefault(require("is-core-module"));
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const common_1 = require("./common");
const follow_1 = require("./follow");
const log_1 = require("./log");
const detector = __importStar(require("./detector"));
// Note: as a developer, you can set the PKG_STRICT_VER variable.
//       this will turn on some assertion in the walker code below
//       to assert that each file content/state that we appending
//       to the virtual file system applies to  a real file,
//       not a symlink.
//       By default assertion are disabled as they can have a
//       performance hit.
const strictVerify = Boolean(process.env.PKG_STRICT_VER);
const win32 = process.platform === 'win32';
function unlikelyJavascript(file) {
    return ['.css', '.html', '.json', '.vue'].includes(path_1.default.extname(file));
}
function isPublic(config) {
    if (config.private) {
        return false;
    }
    const { licenses } = config;
    let { license } = config;
    if (licenses) {
        license = licenses;
    }
    if (license && !Array.isArray(license)) {
        license = typeof license === 'string' ? license : license.type;
    }
    if (Array.isArray(license)) {
        license = license.map((c) => String(c.type || c)).join(',');
    }
    if (!license) {
        return false;
    }
    if (/^\(/.test(license)) {
        license = license.slice(1);
    }
    if (/\)$/.test(license)) {
        license = license.slice(0, -1);
    }
    license = license.toLowerCase();
    const allLicenses = Array.prototype.concat(license.split(' or '), license.split(' and '), license.split('/'), license.split(','));
    let result = false;
    const foss = [
        'isc',
        'mit',
        'apache-2.0',
        'apache 2.0',
        'public domain',
        'bsd',
        'bsd-2-clause',
        'bsd-3-clause',
        'wtfpl',
        'cc-by-3.0',
        'x11',
        'artistic-2.0',
        'gplv3',
        'mpl',
        'mplv2.0',
        'unlicense',
        'apache license 2.0',
        'zlib',
        'mpl-2.0',
        'nasa-1.3',
        'apache license, version 2.0',
        'lgpl-2.1+',
        'cc0-1.0',
    ];
    for (const c of allLicenses) {
        result = foss.indexOf(c) >= 0;
        if (result) {
            break;
        }
    }
    return result;
}
function upon(p, base) {
    if (typeof p !== 'string') {
        throw (0, log_1.wasReported)('Config items must be strings. See examples');
    }
    let negate = false;
    if (p[0] === '!') {
        p = p.slice(1);
        negate = true;
    }
    p = path_1.default.join(base, p);
    if (win32) {
        p = p.replace(/\\/g, '/');
    }
    if (negate) {
        p = `!${p}`;
    }
    return p;
}
function collect(ps) {
    return globby_1.default.sync(ps, { dot: true });
}
function expandFiles(efs, base) {
    if (!Array.isArray(efs)) {
        efs = [efs];
    }
    efs = collect(efs.map((p) => upon(p, base)));
    return efs;
}
async function stepRead(record) {
    if (strictVerify) {
        (0, assert_1.default)(record.file === (0, common_1.toNormalizedRealPath)(record.file));
    }
    let body;
    try {
        body = await fs_extra_1.default.readFile(record.file);
    }
    catch (error) {
        const exception = error;
        log_1.log.error(`Cannot read file, ${exception.code}`, record.file);
        throw (0, log_1.wasReported)(exception.message);
    }
    record.body = body;
}
function stepStrip(record) {
    let body = (record.body || '').toString('utf8');
    if (/^\ufeff/.test(body)) {
        body = body.replace(/^\ufeff/, '');
    }
    if (/^#!/.test(body)) {
        body = body.replace(/^#![^\n]*\n/, '\n');
    }
    record.body = body;
}
function stepDetect(record, marker, derivatives) {
    let { body = '' } = record;
    if (body instanceof Buffer) {
        body = body.toString();
    }
    try {
        detector.detect(body, (node, trying) => {
            const { toplevel } = marker;
            let d = detector.visitorSuccessful(node);
            if (d) {
                if (d.mustExclude) {
                    return false;
                }
                d.mayExclude = d.mayExclude || trying;
                derivatives.push(d);
                return false;
            }
            d = detector.visitorNonLiteral(node);
            if (d) {
                if (typeof d === 'object' && d.mustExclude) {
                    return false;
                }
                const debug = !toplevel || d.mayExclude || trying;
                const level = debug ? 'debug' : 'warn';
                log_1.log[level](`Cannot resolve '${d.alias}'`, [
                    record.file,
                    'Dynamic require may fail at run time, because the requested file',
                    'is unknown at compilation time and not included into executable.',
                    "Use a string literal as an argument for 'require', or leave it",
                    "as is and specify the resolved file name in 'scripts' option.",
                ]);
                return false;
            }
            d = detector.visitorMalformed(node);
            if (d) {
                // there is no 'mustExclude'
                const debug = !toplevel || trying;
                const level = debug ? 'debug' : 'warn'; // there is no 'mayExclude'
                log_1.log[level](`Malformed requirement for '${d.alias}'`, [record.file]);
                return false;
            }
            d = detector.visitorUseSCWD(node);
            if (d) {
                // there is no 'mustExclude'
                const level = 'debug'; // there is no 'mayExclude'
                log_1.log[level](`Path.resolve(${d.alias}) is ambiguous`, [
                    record.file,
                    "It resolves relatively to 'process.cwd' by default, however",
                    "you may want to use 'path.dirname(require.main.filename)'",
                ]);
                return false;
            }
            return true; // can i go inside?
        });
    }
    catch (error) {
        log_1.log.error(error.message, record.file);
        throw (0, log_1.wasReported)(error.message);
    }
}
function findCommonJunctionPoint(file, realFile) {
    // find common denominator => where the link changes
    while ((0, common_1.toNormalizedRealPath)(path_1.default.dirname(file)) === path_1.default.dirname(realFile)) {
        file = path_1.default.dirname(file);
        realFile = path_1.default.dirname(realFile);
    }
    return { file, realFile };
}
class Walker {
    constructor() {
        this.tasks = [];
        this.records = {};
        this.dictionary = {};
        this.patches = {};
        this.params = {};
        this.symLinks = {};
    }
    appendRecord({ file, store }) {
        if (this.records[file]) {
            return;
        }
        if (store === common_1.STORE_BLOB ||
            store === common_1.STORE_CONTENT ||
            store === common_1.STORE_LINKS) {
            // make sure we have a real file
            if (strictVerify) {
                (0, assert_1.default)(file === (0, common_1.toNormalizedRealPath)(file));
            }
        }
        this.records[file] = { file };
    }
    append(task) {
        if (strictVerify) {
            (0, assert_1.default)(typeof task.file === 'string');
            (0, assert_1.default)(task.file === (0, common_1.normalizePath)(task.file));
        }
        this.appendRecord(task);
        this.tasks.push(task);
        const what = {
            [common_1.STORE_BLOB]: 'Bytecode of',
            [common_1.STORE_CONTENT]: 'Content of',
            [common_1.STORE_LINKS]: 'Directory',
            [common_1.STORE_STAT]: 'Stat info of',
        }[task.store];
        if (task.reason) {
            log_1.log.debug(`${what} ${task.file} is added to queue. It was required from ${task.reason}`);
        }
        else {
            log_1.log.debug(`${what} ${task.file} is added to queue.`);
        }
    }
    appendSymlink(file, realFile) {
        const a = findCommonJunctionPoint(file, realFile);
        file = a.file;
        realFile = a.realFile;
        if (!this.symLinks[file]) {
            const dn = path_1.default.dirname(file);
            this.appendFileInFolder({
                file: dn,
                store: common_1.STORE_LINKS,
                data: path_1.default.basename(file),
            });
            log_1.log.debug(`adding symlink ${file}  => ${path_1.default.relative(file, realFile)}`);
            this.symLinks[file] = realFile;
            this.appendStat({
                file: realFile,
                store: common_1.STORE_STAT,
            });
            this.appendStat({
                file: dn,
                store: common_1.STORE_STAT,
            });
            this.appendStat({
                file,
                store: common_1.STORE_STAT,
            });
        }
    }
    appendStat(task) {
        (0, assert_1.default)(task.store === common_1.STORE_STAT);
        this.append(task);
    }
    appendFileInFolder(task) {
        if (strictVerify) {
            (0, assert_1.default)(task.store === common_1.STORE_LINKS);
            (0, assert_1.default)(typeof task.file === 'string');
        }
        const realFile = (0, common_1.toNormalizedRealPath)(task.file);
        if (realFile === task.file) {
            this.append(task);
            return;
        }
        this.append(Object.assign(Object.assign({}, task), { file: realFile }));
        this.appendStat({
            file: task.file,
            store: common_1.STORE_STAT,
        });
        this.appendStat({
            file: path_1.default.dirname(task.file),
            store: common_1.STORE_STAT,
        });
    }
    appendBlobOrContent(task) {
        if (strictVerify) {
            (0, assert_1.default)(task.file === (0, common_1.normalizePath)(task.file));
        }
        (0, assert_1.default)(task.store === common_1.STORE_BLOB || task.store === common_1.STORE_CONTENT);
        (0, assert_1.default)(typeof task.file === 'string');
        const realFile = (0, common_1.toNormalizedRealPath)(task.file);
        if (realFile === task.file) {
            this.append(task);
            return;
        }
        this.append(Object.assign(Object.assign({}, task), { file: realFile }));
        this.appendSymlink(task.file, realFile);
        this.appendStat({
            file: task.file,
            store: common_1.STORE_STAT,
        });
    }
    async appendFilesFromConfig(marker) {
        const { config, configPath, base } = marker;
        const pkgConfig = config === null || config === void 0 ? void 0 : config.pkg;
        if (pkgConfig) {
            let { scripts } = pkgConfig;
            if (scripts) {
                scripts = expandFiles(scripts, base);
                for (const script of scripts) {
                    const stat = await fs_extra_1.default.stat(script);
                    if (stat.isFile()) {
                        if (!(0, common_1.isDotJS)(script) && !(0, common_1.isDotJSON)(script) && !(0, common_1.isDotNODE)(script)) {
                            log_1.log.warn("Non-javascript file is specified in 'scripts'.", [
                                'Pkg will probably fail to parse. Specify *.js in glob.',
                                script,
                            ]);
                        }
                        this.appendBlobOrContent({
                            file: (0, common_1.normalizePath)(script),
                            marker,
                            store: common_1.STORE_BLOB,
                            reason: configPath,
                        });
                    }
                }
            }
            let { assets } = pkgConfig;
            if (assets) {
                assets = expandFiles(assets, base);
                for (const asset of assets) {
                    log_1.log.debug(' Adding asset : .... ', asset);
                    const stat = await fs_extra_1.default.stat(asset);
                    if (stat.isFile()) {
                        this.appendBlobOrContent({
                            file: (0, common_1.normalizePath)(asset),
                            marker,
                            store: common_1.STORE_CONTENT,
                            reason: configPath,
                        });
                    }
                }
            }
        }
        else if (config) {
            let { files } = config;
            if (files) {
                files = expandFiles(files, base);
                for (let file of files) {
                    file = (0, common_1.normalizePath)(file);
                    const stat = await fs_extra_1.default.stat(file);
                    if (stat.isFile()) {
                        // 1) remove sources of top-level(!) package 'files' i.e. ship as BLOB
                        // 2) non-source (non-js) files of top-level package are shipped as CONTENT
                        // 3) parsing some js 'files' of non-top-level packages fails, hence all CONTENT
                        if (marker.toplevel) {
                            this.appendBlobOrContent({
                                file,
                                marker,
                                store: (0, common_1.isDotJS)(file) ? common_1.STORE_BLOB : common_1.STORE_CONTENT,
                                reason: configPath,
                            });
                        }
                        else {
                            this.appendBlobOrContent({
                                file,
                                marker,
                                store: common_1.STORE_CONTENT,
                                reason: configPath,
                            });
                        }
                    }
                }
            }
        }
    }
    async stepActivate(marker, derivatives) {
        if (!marker) {
            (0, assert_1.default)(false);
        }
        if (marker.activated) {
            return;
        }
        const { config, base } = marker;
        if (!config) {
            (0, assert_1.default)(false);
        }
        const { name } = config;
        if (name) {
            const d = this.dictionary[name];
            if (d) {
                if (typeof config.dependencies === 'object' &&
                    typeof d.dependencies === 'object') {
                    Object.assign(config.dependencies, d.dependencies);
                    delete d.dependencies;
                }
                Object.assign(config, d);
                marker.hasDictionary = true;
            }
        }
        const { dependencies } = config;
        if (typeof dependencies === 'object') {
            for (const dependency in dependencies) {
                // it may be `undefined` - overridden
                // in dictionary (see publicsuffixlist)
                if (dependencies[dependency]) {
                    derivatives.push({
                        alias: dependency,
                        aliasType: common_1.ALIAS_AS_RESOLVABLE,
                        fromDependencies: true,
                    });
                    derivatives.push({
                        alias: `${dependency}/package.json`,
                        aliasType: common_1.ALIAS_AS_RESOLVABLE,
                        fromDependencies: true,
                    });
                }
            }
        }
        const pkgConfig = config.pkg;
        if (pkgConfig) {
            const { patches } = pkgConfig;
            if (patches) {
                for (const key in patches) {
                    if (patches[key]) {
                        const p = path_1.default.join(base, key);
                        this.patches[p] = patches[key];
                    }
                }
            }
            const { deployFiles } = pkgConfig;
            if (deployFiles) {
                marker.hasDeployFiles = true;
                for (const deployFile of deployFiles) {
                    const type = deployFile[2] || 'file';
                    log_1.log.warn(`Cannot include ${type} %1 into executable.`, [
                        `The ${type} must be distributed with executable as %2.`,
                        `%1: ${path_1.default.relative(process.cwd(), path_1.default.join(base, deployFile[0]))}`,
                        `%2: path-to-executable/${deployFile[1]}`,
                    ]);
                }
            }
            if (pkgConfig.log) {
                pkgConfig.log(log_1.log, { packagePath: base });
            }
        }
        await this.appendFilesFromConfig(marker);
        marker.public = isPublic(config);
        if (!marker.public && marker.toplevel) {
            marker.public = this.params.publicToplevel;
        }
        if (!marker.public && !marker.toplevel && this.params.publicPackages) {
            marker.public =
                this.params.publicPackages[0] === '*' ||
                    (!!name && this.params.publicPackages.indexOf(name) !== -1);
        }
        marker.activated = true;
        // assert no further work with config
        delete marker.config;
    }
    hasPatch(record) {
        const patch = this.patches[record.file];
        if (!patch) {
            return;
        }
        return true;
    }
    stepPatch(record) {
        const patch = this.patches[record.file];
        if (!patch) {
            return;
        }
        let body = (record.body || '').toString('utf8');
        for (let i = 0; i < patch.length; i += 2) {
            if (typeof patch[i] === 'object') {
                if (patch[i].do === 'erase') {
                    body = patch[i + 1];
                }
                else if (patch[i].do === 'prepend') {
                    body = patch[i + 1] + body;
                }
                else if (patch[i].do === 'append') {
                    body += patch[i + 1];
                }
            }
            else if (typeof patch[i] === 'string') {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                // function escapeRegExp
                const esc = patch[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexp = new RegExp(esc, 'g');
                body = body.replace(regexp, patch[i + 1]);
            }
        }
        record.body = body;
    }
    async stepDerivatives_ALIAS_AS_RELATIVE(record, marker, derivative) {
        const file = (0, common_1.normalizePath)(path_1.default.join(path_1.default.dirname(record.file), derivative.alias));
        let stat;
        try {
            stat = await fs_extra_1.default.stat(file);
        }
        catch (error) {
            const { toplevel } = marker;
            const exception = error;
            const debug = !toplevel && exception.code === 'ENOENT';
            const level = debug ? 'debug' : 'warn';
            log_1.log[level](`Cannot stat, ${exception.code}`, [
                file,
                `The file was required from '${record.file}'`,
            ]);
        }
        if (stat && stat.isFile()) {
            this.appendBlobOrContent({
                file,
                marker,
                store: common_1.STORE_CONTENT,
                reason: record.file,
            });
        }
    }
    async stepDerivatives_ALIAS_AS_RESOLVABLE(record, marker, derivative) {
        var _a, _b;
        const newPackages = [];
        const catchReadFile = (file) => {
            (0, assert_1.default)((0, common_1.isPackageJson)(file), `walker: ${file} must be package.json`);
            newPackages.push({ packageJson: file });
        };
        const catchPackageFilter = (config, base) => {
            const newPackage = newPackages[newPackages.length - 1];
            newPackage.marker = { config, configPath: newPackage.packageJson, base };
        };
        let newFile = '';
        let failure;
        const basedir = path_1.default.dirname(record.file);
        try {
            newFile = await (0, follow_1.follow)(derivative.alias, {
                basedir,
                // default is extensions: ['.js'], but
                // it is not enough because 'typos.json'
                // is not taken in require('./typos')
                // in 'normalize-package-data/lib/fixer.js'
                extensions: ['.js', '.json', '.node'],
                catchReadFile,
                catchPackageFilter,
            });
        }
        catch (error) {
            failure = error;
        }
        if (failure) {
            const { toplevel } = marker;
            const mainNotFound = newPackages.length > 0 && !((_b = (_a = newPackages[0].marker) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.main);
            const debug = !toplevel ||
                derivative.mayExclude ||
                (mainNotFound && derivative.fromDependencies);
            const level = debug ? 'debug' : 'warn';
            if (mainNotFound) {
                const message = "Entry 'main' not found in %1";
                log_1.log[level](message, [
                    `%1: ${newPackages[0].packageJson}`,
                    `%2: ${record.file}`,
                ]);
            }
            else {
                log_1.log[level](`${chalk_1.default.yellow(failure.message)}  in ${record.file}`);
            }
            return;
        }
        let newPackageForNewRecords;
        for (const newPackage of newPackages) {
            let newFile2;
            try {
                newFile2 = await (0, follow_1.follow)(derivative.alias, {
                    basedir: path_1.default.dirname(record.file),
                    extensions: ['.js', '.json', '.node'],
                    ignoreFile: newPackage.packageJson,
                });
                if (strictVerify) {
                    (0, assert_1.default)(newFile2 === (0, common_1.normalizePath)(newFile2));
                }
            }
            catch (_) {
                // not setting is enough
            }
            if (newFile2 !== newFile) {
                newPackageForNewRecords = newPackage;
                break;
            }
        }
        if (newPackageForNewRecords) {
            if (strictVerify) {
                (0, assert_1.default)(newPackageForNewRecords.packageJson ===
                    (0, common_1.normalizePath)(newPackageForNewRecords.packageJson));
            }
            this.appendBlobOrContent({
                file: newPackageForNewRecords.packageJson,
                marker: newPackageForNewRecords.marker,
                store: common_1.STORE_CONTENT,
                reason: record.file,
            });
        }
        this.appendBlobOrContent({
            file: newFile,
            marker: newPackageForNewRecords ? newPackageForNewRecords.marker : marker,
            store: common_1.STORE_BLOB,
            reason: record.file,
        });
    }
    async stepDerivatives(record, marker, derivatives) {
        for (const derivative of derivatives) {
            // TODO: actually use the target node version
            if ((0, is_core_module_1.default)(derivative.alias, '99.0.0'))
                continue;
            switch (derivative.aliasType) {
                case common_1.ALIAS_AS_RELATIVE:
                    await this.stepDerivatives_ALIAS_AS_RELATIVE(record, marker, derivative);
                    break;
                case common_1.ALIAS_AS_RESOLVABLE:
                    await this.stepDerivatives_ALIAS_AS_RESOLVABLE(record, marker, derivative);
                    break;
                default:
                    (0, assert_1.default)(false, `walker: unknown aliasType ${derivative.aliasType}`);
            }
        }
    }
    async step_STORE_ANY(record, marker, store) {
        if (strictVerify) {
            (0, assert_1.default)(record.file === (0, common_1.toNormalizedRealPath)(record.file));
        }
        if (record[store] !== undefined)
            return;
        record[store] = false; // default is discard
        this.appendStat({
            file: record.file,
            store: common_1.STORE_STAT,
        });
        const derivatives1 = [];
        await this.stepActivate(marker, derivatives1);
        await this.stepDerivatives(record, marker, derivatives1);
        if (store === common_1.STORE_BLOB) {
            if (unlikelyJavascript(record.file) || (0, common_1.isDotNODE)(record.file)) {
                this.appendBlobOrContent({
                    file: record.file,
                    marker,
                    store: common_1.STORE_CONTENT,
                });
                return; // discard
            }
            if (marker.public || marker.hasDictionary) {
                this.appendBlobOrContent({
                    file: record.file,
                    marker,
                    store: common_1.STORE_CONTENT,
                });
            }
        }
        if (store === common_1.STORE_BLOB || this.hasPatch(record)) {
            if (!record.body) {
                await stepRead(record);
                this.stepPatch(record);
                if (store === common_1.STORE_BLOB) {
                    stepStrip(record);
                }
            }
            if (store === common_1.STORE_BLOB) {
                const derivatives2 = [];
                stepDetect(record, marker, derivatives2);
                await this.stepDerivatives(record, marker, derivatives2);
            }
        }
        record[store] = true;
    }
    step_STORE_LINKS(record, data) {
        if (strictVerify) {
            (0, assert_1.default)(record.file === (0, common_1.toNormalizedRealPath)(record.file), ' expecting real file !!!');
        }
        if (record[common_1.STORE_LINKS]) {
            record[common_1.STORE_LINKS].push(data);
            return;
        }
        record[common_1.STORE_LINKS] = [data];
        if (record[common_1.STORE_STAT]) {
            return;
        }
        this.appendStat({
            file: record.file,
            store: common_1.STORE_STAT,
        });
    }
    async step_STORE_STAT(record) {
        if (record[common_1.STORE_STAT])
            return;
        const realPath = (0, common_1.toNormalizedRealPath)(record.file);
        if (realPath !== record.file) {
            this.appendStat({
                file: realPath,
                store: common_1.STORE_STAT,
            });
        }
        try {
            const valueStat = await fs_extra_1.default.stat(record.file);
            const value = {
                mode: valueStat.mode,
                size: valueStat.isFile() ? valueStat.size : 0,
                isFileValue: valueStat.isFile(),
                isDirectoryValue: valueStat.isDirectory(),
                isSocketValue: valueStat.isSocket(),
                isSymbolicLinkValue: valueStat.isSymbolicLink(),
            };
            record[common_1.STORE_STAT] = value;
        }
        catch (error) {
            const exception = error;
            log_1.log.error(`Cannot stat, ${exception.code}`, record.file);
            throw (0, log_1.wasReported)(exception.message);
        }
        if (path_1.default.dirname(record.file) !== record.file) {
            // root directory
            this.appendFileInFolder({
                file: path_1.default.dirname(record.file),
                store: common_1.STORE_LINKS,
                data: path_1.default.basename(record.file),
            });
        }
    }
    async step(task) {
        const { file, store, data } = task;
        const record = this.records[file];
        switch (store) {
            case common_1.STORE_BLOB:
            case common_1.STORE_CONTENT:
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                await this.step_STORE_ANY(record, task.marker, store);
                break;
            case common_1.STORE_LINKS:
                this.step_STORE_LINKS(record, data);
                break;
            case common_1.STORE_STAT:
                await this.step_STORE_STAT(record);
                break;
            default:
                (0, assert_1.default)(false, `walker: unknown store ${store}`);
        }
    }
    async readDictionary(marker) {
        var _a, _b, _c;
        if (((_a = this.params.noDictionary) === null || _a === void 0 ? void 0 : _a[0]) === '*') {
            return;
        }
        const dd = path_1.default.join(__dirname, '../dictionary');
        const files = await fs_extra_1.default.readdir(dd);
        for (const file of files) {
            if (/\.js$/.test(file)) {
                const name = file.slice(0, -3);
                if ((_b = this.params.noDictionary) === null || _b === void 0 ? void 0 : _b.includes(file)) {
                    continue;
                }
                // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
                const config = require(path_1.default.join(dd, file));
                this.dictionary[name] = config;
            }
        }
        const pkgConfig = (_c = marker.config) === null || _c === void 0 ? void 0 : _c.pkg;
        if (pkgConfig) {
            const { dictionary } = pkgConfig;
            if (dictionary) {
                for (const name in dictionary) {
                    if (dictionary[name]) {
                        this.dictionary[name] = { pkg: dictionary[name] };
                    }
                }
            }
        }
    }
    async start(marker, entrypoint, addition, params) {
        this.params = params;
        this.symLinks = {};
        await this.readDictionary(marker);
        entrypoint = (0, common_1.normalizePath)(entrypoint);
        this.appendBlobOrContent({
            file: entrypoint,
            marker,
            store: common_1.STORE_BLOB,
        });
        if (addition) {
            addition = (0, common_1.normalizePath)(addition);
            this.appendBlobOrContent({
                file: addition,
                marker,
                store: common_1.STORE_CONTENT,
            });
        }
        const { tasks } = this;
        for (let i = 0; i < tasks.length; i += 1) {
            // NO MULTIPLE WORKERS! THIS WILL LEAD TO NON-DETERMINISTIC
            // ORDER. one-by-one fifo is the only way to iterate tasks
            await this.step(tasks[i]);
        }
        return {
            symLinks: this.symLinks,
            records: this.records,
            entrypoint: (0, common_1.normalizePath)(entrypoint),
        };
    }
}
async function walker(...args) {
    const w = new Walker();
    return w.start(...args);
}
exports.default = walker;
//# sourceMappingURL=walker.js.map