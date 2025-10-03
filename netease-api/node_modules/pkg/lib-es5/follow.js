"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.follow = void 0;
const resolve_1 = require("resolve");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const common_1 = require("./common");
const PROOF = 'a-proof-that-main-is-captured.js';
function parentDirectoriesContain(parent, directory) {
    let currentParent = parent;
    while (true) {
        if (currentParent === directory) {
            return true;
        }
        const newParent = path_1.default.dirname(currentParent);
        if (newParent === currentParent) {
            return false;
        }
        currentParent = newParent;
    }
}
function follow(x, opts) {
    // TODO async version
    return new Promise((resolve) => {
        resolve((0, resolve_1.sync)(x, {
            basedir: opts.basedir,
            extensions: opts.extensions,
            isFile: (file) => {
                if (opts.ignoreFile &&
                    path_1.default.join(path_1.default.dirname(opts.ignoreFile), PROOF) === file) {
                    return true;
                }
                let stat;
                try {
                    stat = fs_1.default.statSync(file);
                }
                catch (e) {
                    const ex = e;
                    if (ex && (ex.code === 'ENOENT' || ex.code === 'ENOTDIR'))
                        return false;
                    throw ex;
                }
                return stat.isFile() || stat.isFIFO();
            },
            isDirectory: (directory) => {
                if (opts.ignoreFile &&
                    parentDirectoriesContain(opts.ignoreFile, directory)) {
                    return false;
                }
                let stat;
                try {
                    stat = fs_1.default.statSync(directory);
                }
                catch (e) {
                    const ex = e;
                    if (ex && (ex.code === 'ENOENT' || ex.code === 'ENOTDIR')) {
                        return false;
                    }
                    throw ex;
                }
                return stat.isDirectory();
            },
            readFileSync: (file) => {
                if (opts.ignoreFile && opts.ignoreFile === file) {
                    return Buffer.from(`{"main":"${PROOF}"}`);
                }
                if (opts.catchReadFile) {
                    opts.catchReadFile(file);
                }
                return fs_1.default.readFileSync(file);
            },
            packageFilter: (config, base, dir) => {
                if (opts.catchPackageFilter) {
                    opts.catchPackageFilter(config, base, dir);
                }
                return config;
            },
            /** function to synchronously resolve a potential symlink to its real path */
            // realpathSync?: (file: string) => string;
            realpathSync: (file) => {
                const file2 = (0, common_1.toNormalizedRealPath)(file);
                return file2;
            },
        }));
    });
}
exports.follow = follow;
//# sourceMappingURL=follow.js.map