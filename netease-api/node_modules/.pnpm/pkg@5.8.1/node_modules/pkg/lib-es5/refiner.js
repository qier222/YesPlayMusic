"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const common_1 = require("./common");
const log_1 = require("./log");
const win32 = process.platform === 'win32';
function hasParent(file, records) {
    const dirname = path_1.default.dirname(file);
    // root directory
    if (dirname === file) {
        return false;
    }
    return Boolean(records[dirname]);
}
function purgeTopDirectories(records) {
    while (true) {
        let found = false;
        for (const file in records) {
            if (records[file]) {
                const record = records[file];
                const links = record[common_1.STORE_LINKS];
                if (links && links.length === 1) {
                    if (!hasParent(file, records)) {
                        const file2 = path_1.default.join(file, links[0]);
                        const record2 = records[file2];
                        const links2 = record2[common_1.STORE_LINKS];
                        if (links2 && links2.length === 1) {
                            const file3 = path_1.default.join(file2, links2[0]);
                            const record3 = records[file3];
                            const links3 = record3[common_1.STORE_LINKS];
                            if (links3) {
                                delete records[file];
                                log_1.log.debug(chalk_1.default.cyan('Deleting record file :', file));
                                found = true;
                            }
                        }
                    }
                }
            }
        }
        if (!found)
            break;
    }
}
function denominate(records, entrypoint, denominator, symLinks) {
    const newRecords = {};
    const makeSnap = (file) => {
        let snap = (0, common_1.substituteDenominator)(file, denominator);
        if (win32) {
            if (snap.slice(1) === ':')
                snap += '\\';
        }
        else if (snap === '') {
            snap = '/';
        }
        return snap;
    };
    for (const file in records) {
        if (records[file]) {
            const snap = makeSnap(file);
            newRecords[snap] = records[file];
        }
    }
    const tmpSymLinks = symLinks;
    symLinks = {};
    for (const [key, value] of Object.entries(tmpSymLinks)) {
        const key1 = makeSnap(key);
        const value1 = makeSnap(value);
        symLinks[key1] = value1;
    }
    return {
        records: newRecords,
        entrypoint: (0, common_1.substituteDenominator)(entrypoint, denominator),
        symLinks,
    };
}
function refiner(records, entrypoint, symLinks) {
    purgeTopDirectories(records);
    const denominator = (0, common_1.retrieveDenominator)(Object.keys(records));
    return denominate(records, entrypoint, denominator, symLinks);
}
exports.default = refiner;
//# sourceMappingURL=refiner.js.map