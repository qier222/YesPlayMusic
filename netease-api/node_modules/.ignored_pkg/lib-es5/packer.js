"use strict";
/* eslint-disable complexity */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const common_1 = require("./common");
const log_1 = require("./log");
const { version } = JSON.parse(fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '../package.json'), 'utf-8'));
const bootstrapText = fs_extra_1.default
    .readFileSync(require.resolve('../prelude/bootstrap.js'), 'utf8')
    .replace('%VERSION%', version);
const commonText = fs_extra_1.default.readFileSync(require.resolve('./common'), 'utf8');
const diagnosticText = fs_extra_1.default.readFileSync(require.resolve('../prelude/diagnostic.js'), 'utf8');
function itemsToText(items) {
    const len = items.length;
    return len.toString() + (len % 10 === 1 ? ' item' : ' items');
}
function hasAnyStore(record) {
    // discarded records like native addons
    for (const store of [common_1.STORE_BLOB, common_1.STORE_CONTENT, common_1.STORE_LINKS, common_1.STORE_STAT]) {
        if (record[store])
            return true;
    }
    return false;
}
function packer({ records, entrypoint, bytecode, }) {
    const stripes = [];
    for (const snap in records) {
        if (records[snap]) {
            const record = records[snap];
            const { file } = record;
            if (!hasAnyStore(record)) {
                continue;
            }
            (0, assert_1.default)(record[common_1.STORE_STAT], 'packer: no STORE_STAT');
            (0, assert_1.default)(record[common_1.STORE_BLOB] ||
                record[common_1.STORE_CONTENT] ||
                record[common_1.STORE_LINKS] ||
                record[common_1.STORE_STAT]);
            if (record[common_1.STORE_BLOB] && !bytecode) {
                delete record[common_1.STORE_BLOB];
                if (!record[common_1.STORE_CONTENT]) {
                    // TODO make a test for it?
                    throw (0, log_1.wasReported)('--no-bytecode and no source breaks final executable', [
                        file,
                        'Please run with "-d" and without "--no-bytecode" first, and make',
                        'sure that debug log does not contain "was included as bytecode".',
                    ]);
                }
            }
            for (const store of [
                common_1.STORE_BLOB,
                common_1.STORE_CONTENT,
                common_1.STORE_LINKS,
                common_1.STORE_STAT,
            ]) {
                const value = record[store];
                if (!value) {
                    continue;
                }
                if (store === common_1.STORE_BLOB || store === common_1.STORE_CONTENT) {
                    if (record.body === undefined) {
                        stripes.push({ snap, store, file });
                    }
                    else if (Buffer.isBuffer(record.body)) {
                        stripes.push({ snap, store, buffer: record.body });
                    }
                    else if (typeof record.body === 'string') {
                        stripes.push({ snap, store, buffer: Buffer.from(record.body) });
                    }
                    else {
                        (0, assert_1.default)(false, 'packer: bad STORE_BLOB/STORE_CONTENT');
                    }
                }
                else if (store === common_1.STORE_LINKS) {
                    if (Array.isArray(value)) {
                        const dedupedValue = [...new Set(value)];
                        log_1.log.debug('files & folders deduped = ', dedupedValue);
                        const buffer = Buffer.from(JSON.stringify(dedupedValue));
                        stripes.push({ snap, store, buffer });
                    }
                    else {
                        (0, assert_1.default)(false, 'packer: bad STORE_LINKS');
                    }
                }
                else if (store === common_1.STORE_STAT) {
                    if (typeof value === 'object') {
                        const newStat = Object.assign({}, value);
                        const buffer = Buffer.from(JSON.stringify(newStat));
                        stripes.push({ snap, store, buffer });
                    }
                    else {
                        (0, assert_1.default)(false, 'packer: unknown store');
                    }
                }
                if (record[common_1.STORE_CONTENT]) {
                    const disclosed = (0, common_1.isDotJS)(file) || (0, common_1.isDotJSON)(file);
                    log_1.log.debug(disclosed
                        ? 'The file was included as DISCLOSED code (with sources)'
                        : 'The file was included as asset content', file);
                }
                else if (record[common_1.STORE_BLOB]) {
                    log_1.log.debug('The file was included as bytecode (no sources)', file);
                }
                else if (record[common_1.STORE_LINKS]) {
                    const link = record[common_1.STORE_LINKS];
                    log_1.log.debug(`The directory files list was included (${itemsToText(link)})`, file);
                }
            }
        }
    }
    const prelude = `return (function (REQUIRE_COMMON, VIRTUAL_FILESYSTEM, DEFAULT_ENTRYPOINT, SYMLINKS, DICT, DOCOMPRESS) {
        ${bootstrapText}${log_1.log.debugMode ? diagnosticText : ''}\n})(function (exports) {\n${commonText}\n},\n` +
        `%VIRTUAL_FILESYSTEM%` +
        `\n,\n` +
        `%DEFAULT_ENTRYPOINT%` +
        `\n,\n` +
        `%SYMLINKS%` +
        '\n,\n' +
        '%DICT%' +
        '\n,\n' +
        '%DOCOMPRESS%' +
        `\n);`;
    return { prelude, entrypoint, stripes };
}
exports.default = packer;
//# sourceMappingURL=packer.js.map