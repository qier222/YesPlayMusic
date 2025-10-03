"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zlib_1 = require("zlib");
const multistream_1 = __importDefault(require("multistream"));
const assert_1 = __importDefault(require("assert"));
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const into_stream_1 = __importDefault(require("into-stream"));
const path_1 = __importDefault(require("path"));
const stream_meter_1 = __importDefault(require("stream-meter"));
const common_1 = require("./common");
const log_1 = require("./log");
const fabricator_1 = require("./fabricator");
const types_1 = require("./types");
const compress_type_1 = require("./compress_type");
function discoverPlaceholder(binaryBuffer, searchString, padder) {
    const placeholder = Buffer.from(searchString);
    const position = binaryBuffer.indexOf(placeholder);
    if (position === -1) {
        return { notFound: true };
    }
    return { position, size: placeholder.length, padder };
}
function injectPlaceholder(fd, placeholder, value, cb) {
    if ('notFound' in placeholder) {
        (0, assert_1.default)(false, 'Placeholder for not found');
    }
    const { position, size, padder } = placeholder;
    let stringValue = Buffer.from('');
    if (typeof value === 'number') {
        stringValue = Buffer.from(value.toString());
    }
    else if (typeof value === 'string') {
        stringValue = Buffer.from(value);
    }
    else {
        stringValue = value;
    }
    const padding = Buffer.from(padder.repeat(size - stringValue.length));
    stringValue = Buffer.concat([stringValue, padding]);
    fs_extra_1.default.write(fd, stringValue, 0, stringValue.length, position, cb);
}
function discoverPlaceholders(binaryBuffer) {
    return {
        BAKERY: discoverPlaceholder(binaryBuffer, `\0${'// BAKERY '.repeat(20)}`, '\0'),
        PAYLOAD_POSITION: discoverPlaceholder(binaryBuffer, '// PAYLOAD_POSITION //', ' '),
        PAYLOAD_SIZE: discoverPlaceholder(binaryBuffer, '// PAYLOAD_SIZE //', ' '),
        PRELUDE_POSITION: discoverPlaceholder(binaryBuffer, '// PRELUDE_POSITION //', ' '),
        PRELUDE_SIZE: discoverPlaceholder(binaryBuffer, '// PRELUDE_SIZE //', ' '),
    };
}
function injectPlaceholders(fd, placeholders, values, cb) {
    injectPlaceholder(fd, placeholders.BAKERY, values.BAKERY, (error) => {
        if (error) {
            return cb(error);
        }
        injectPlaceholder(fd, placeholders.PAYLOAD_POSITION, values.PAYLOAD_POSITION, (error2) => {
            if (error2) {
                return cb(error2);
            }
            injectPlaceholder(fd, placeholders.PAYLOAD_SIZE, values.PAYLOAD_SIZE, (error3) => {
                if (error3) {
                    return cb(error3);
                }
                injectPlaceholder(fd, placeholders.PRELUDE_POSITION, values.PRELUDE_POSITION, (error4) => {
                    if (error4) {
                        return cb(error4);
                    }
                    injectPlaceholder(fd, placeholders.PRELUDE_SIZE, values.PRELUDE_SIZE, cb);
                });
            });
        });
    });
}
function makeBakeryValueFromBakes(bakes) {
    const parts = [];
    if (bakes.length) {
        for (let i = 0; i < bakes.length; i += 1) {
            parts.push(Buffer.from(bakes[i]));
            parts.push(Buffer.alloc(1));
        }
        parts.push(Buffer.alloc(1));
    }
    return Buffer.concat(parts);
}
function replaceDollarWise(s, sf, st) {
    return s.replace(sf, () => st);
}
function makePreludeBufferFromPrelude(prelude) {
    return Buffer.from(`(function(process, require, console, EXECPATH_FD, PAYLOAD_POSITION, PAYLOAD_SIZE) { ${prelude}\n})` // dont remove \n
    );
}
function findPackageJson(nodeFile) {
    let dir = nodeFile;
    while (dir !== '/') {
        dir = path_1.default.dirname(dir);
        if (fs_extra_1.default.existsSync(path_1.default.join(dir, 'package.json'))) {
            break;
        }
    }
    if (dir === '/') {
        throw new Error(`package.json not found for "${nodeFile}"`);
    }
    return dir;
}
function nativePrebuildInstall(target, nodeFile) {
    var _a, _b;
    const prebuildInstall = path_1.default.join(__dirname, '../node_modules/.bin/prebuild-install');
    const dir = findPackageJson(nodeFile);
    // parse the target node version from the binaryPath
    const nodeVersion = path_1.default.basename(target.binaryPath).split('-')[1];
    if (!/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(nodeVersion)) {
        throw new Error(`Couldn't find node version, instead got: ${nodeVersion}`);
    }
    const nativeFile = `${nodeFile}.${target.platform}.${nodeVersion}`;
    if (fs_extra_1.default.existsSync(nativeFile)) {
        return nativeFile;
    }
    // prebuild-install will overwrite the target .node file, so take a backup
    if (!fs_extra_1.default.existsSync(`${nodeFile}.bak`)) {
        fs_extra_1.default.copyFileSync(nodeFile, `${nodeFile}.bak`);
    }
    const napiVersions = (_b = (_a = JSON.parse(fs_extra_1.default.readFileSync(path_1.default.join(dir, 'package.json'), { encoding: 'utf-8' }))) === null || _a === void 0 ? void 0 : _a.binary) === null || _b === void 0 ? void 0 : _b.napi_versions;
    const options = [
        '--platform',
        types_1.platform[target.platform],
        '--arch',
        target.arch,
    ];
    if (napiVersions == null) {
        // TODO: consider target node version and supported n-api version
        options.push('--target', nodeVersion);
    }
    // run prebuild
    (0, child_process_1.execFileSync)(prebuildInstall, options, { cwd: dir });
    // move the prebuild to a new name with a platform/version extension
    fs_extra_1.default.copyFileSync(nodeFile, nativeFile);
    // put the backed up file back
    fs_extra_1.default.moveSync(`${nodeFile}.bak`, nodeFile, { overwrite: true });
    return nativeFile;
}
/**
 * instead of creating a vfs dicionnary with actual path as key
 * we use a compression mechanism that can reduce significantly
 * the memory footprint of the vfs in the code.
 *
 * without vfs compression:
 *
 * vfs = {
 *   "/folder1/folder2/file1.js": {};
 *   "/folder1/folder2/folder3/file2.js": {};
 *   "/folder1/folder2/folder3/file3.js": {};
 * }
 *
 * with compression :
 *
 * fileDictionary = {
 *    "folder1": "1",
 *    "folder2": "2",
 *    "file1": "3",
 *    "folder3": "4",
 *    "file2": "5",
 *    "file3": "6",
 * }
 * vfs = {
 *   "/1/2/3": {};
 *   "/1/2/4/5": {};
 *   "/1/2/4/6": {};
 * }
 *
 * note: the key is computed in base36 for further compression.
 */
const fileDictionary = {};
let counter = 0;
function getOrCreateHash(fileOrFolderName) {
    let existingKey = fileDictionary[fileOrFolderName];
    if (!existingKey) {
        const newkey = counter;
        counter += 1;
        existingKey = newkey.toString(36);
        fileDictionary[fileOrFolderName] = existingKey;
    }
    return existingKey;
}
const separator = '/';
function makeKey(doCompression, fullpath, slash) {
    if (doCompression === compress_type_1.CompressType.None)
        return fullpath;
    return fullpath.split(slash).map(getOrCreateHash).join(separator);
}
function producer({ backpack, bakes, slash, target, symLinks, doCompress, nativeBuild, }) {
    return new Promise((resolve, reject) => {
        if (!Buffer.alloc) {
            throw (0, log_1.wasReported)('Your node.js does not have Buffer.alloc. Please upgrade!');
        }
        const { prelude } = backpack;
        let { entrypoint, stripes } = backpack;
        entrypoint = (0, common_1.snapshotify)(entrypoint, slash);
        stripes = stripes.slice();
        const vfs = {};
        for (const stripe of stripes) {
            let { snap } = stripe;
            snap = (0, common_1.snapshotify)(snap, slash);
            const vfsKey = makeKey(doCompress, snap, slash);
            if (!vfs[vfsKey])
                vfs[vfsKey] = {};
        }
        const snapshotSymLinks = {};
        for (const [key, value] of Object.entries(symLinks)) {
            const k = (0, common_1.snapshotify)(key, slash);
            const v = (0, common_1.snapshotify)(value, slash);
            const vfsKey = makeKey(doCompress, k, slash);
            snapshotSymLinks[vfsKey] = makeKey(doCompress, v, slash);
        }
        let meter;
        let count = 0;
        function pipeToNewMeter(s) {
            meter = (0, stream_meter_1.default)();
            return s.pipe(meter);
        }
        function pipeMayCompressToNewMeter(s) {
            if (doCompress === compress_type_1.CompressType.GZip) {
                return pipeToNewMeter(s.pipe((0, zlib_1.createGzip)()));
            }
            if (doCompress === compress_type_1.CompressType.Brotli) {
                return pipeToNewMeter(s.pipe((0, zlib_1.createBrotliCompress)()));
            }
            return pipeToNewMeter(s);
        }
        function next(s) {
            count += 1;
            return pipeToNewMeter(s);
        }
        const binaryBuffer = fs_extra_1.default.readFileSync(target.binaryPath);
        const placeholders = discoverPlaceholders(binaryBuffer);
        let track = 0;
        let prevStripe;
        let payloadPosition;
        let payloadSize;
        let preludePosition;
        let preludeSize;
        new multistream_1.default((cb) => {
            if (count === 0) {
                return cb(null, next((0, into_stream_1.default)(binaryBuffer)));
            }
            if (count === 1) {
                payloadPosition = meter.bytes;
                return cb(null, next((0, into_stream_1.default)(Buffer.alloc(0))));
            }
            if (count === 2) {
                if (prevStripe && !prevStripe.skip) {
                    const { store } = prevStripe;
                    let { snap } = prevStripe;
                    snap = (0, common_1.snapshotify)(snap, slash);
                    const vfsKey = makeKey(doCompress, snap, slash);
                    vfs[vfsKey][store] = [track, meter.bytes];
                    track += meter.bytes;
                }
                if (stripes.length) {
                    // clone to prevent 'skip' propagate
                    // to other targets, since same stripe
                    // is used for several targets
                    const stripe = Object.assign({}, stripes.shift());
                    prevStripe = stripe;
                    if (stripe.buffer) {
                        if (stripe.store === common_1.STORE_BLOB) {
                            const snap = (0, common_1.snapshotify)(stripe.snap, slash);
                            return (0, fabricator_1.fabricateTwice)(bakes, target.fabricator, snap, stripe.buffer, (error, buffer) => {
                                if (error) {
                                    log_1.log.warn(error.message);
                                    stripe.skip = true;
                                    return cb(null, (0, into_stream_1.default)(Buffer.alloc(0)));
                                }
                                cb(null, pipeMayCompressToNewMeter((0, into_stream_1.default)(buffer || Buffer.from(''))));
                            });
                        }
                        return cb(null, pipeMayCompressToNewMeter((0, into_stream_1.default)(stripe.buffer)));
                    }
                    if (stripe.file) {
                        if (stripe.file === target.output) {
                            return cb((0, log_1.wasReported)('Trying to take executable into executable', stripe.file), null);
                        }
                        assert_1.default.strictEqual(stripe.store, common_1.STORE_CONTENT); // others must be buffers from walker
                        if ((0, common_1.isDotNODE)(stripe.file) && nativeBuild) {
                            try {
                                const platformFile = nativePrebuildInstall(target, stripe.file);
                                if (fs_extra_1.default.existsSync(platformFile)) {
                                    return cb(null, pipeMayCompressToNewMeter(fs_extra_1.default.createReadStream(platformFile)));
                                }
                            }
                            catch (err) {
                                log_1.log.debug(`prebuild-install failed[${stripe.file}]:`, err.message);
                            }
                        }
                        return cb(null, pipeMayCompressToNewMeter(fs_extra_1.default.createReadStream(stripe.file)));
                    }
                    (0, assert_1.default)(false, 'producer: bad stripe');
                }
                else {
                    payloadSize = track;
                    preludePosition = payloadPosition + payloadSize;
                    return cb(null, next((0, into_stream_1.default)(makePreludeBufferFromPrelude(replaceDollarWise(replaceDollarWise(replaceDollarWise(replaceDollarWise(replaceDollarWise(prelude, '%VIRTUAL_FILESYSTEM%', JSON.stringify(vfs)), '%DEFAULT_ENTRYPOINT%', JSON.stringify(entrypoint)), '%SYMLINKS%', JSON.stringify(snapshotSymLinks)), '%DICT%', JSON.stringify(fileDictionary)), '%DOCOMPRESS%', JSON.stringify(doCompress))))));
                }
            }
            else {
                return cb(null, null);
            }
        })
            .on('error', (error) => {
            reject(error);
        })
            .pipe(fs_extra_1.default.createWriteStream(target.output))
            .on('error', (error) => {
            reject(error);
        })
            .on('close', () => {
            preludeSize = meter.bytes;
            fs_extra_1.default.open(target.output, 'r+', (error, fd) => {
                if (error)
                    return reject(error);
                injectPlaceholders(fd, placeholders, {
                    BAKERY: makeBakeryValueFromBakes(bakes),
                    PAYLOAD_POSITION: payloadPosition,
                    PAYLOAD_SIZE: payloadSize,
                    PRELUDE_POSITION: preludePosition,
                    PRELUDE_SIZE: preludeSize,
                }, (error2) => {
                    if (error2)
                        return reject(error2);
                    fs_extra_1.default.close(fd, (error3) => {
                        if (error3)
                            return reject(error3);
                        resolve();
                    });
                });
            });
        });
    });
}
exports.default = producer;
//# sourceMappingURL=producer.js.map