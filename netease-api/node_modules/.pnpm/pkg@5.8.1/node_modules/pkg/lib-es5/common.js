"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNormalizedRealPath = exports.removeUplevels = exports.stripSnapshot = exports.insideSnapshot = exports.snapshotify = exports.substituteDenominator = exports.retrieveDenominator = exports.isDotNODE = exports.isDotJSON = exports.isDotJS = exports.isPackageJson = exports.normalizePath = exports.isRootPath = exports.ALIAS_AS_RESOLVABLE = exports.ALIAS_AS_RELATIVE = exports.STORE_STAT = exports.STORE_LINKS = exports.STORE_CONTENT = exports.STORE_BLOB = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.STORE_BLOB = 0;
exports.STORE_CONTENT = 1;
exports.STORE_LINKS = 2;
exports.STORE_STAT = 3;
exports.ALIAS_AS_RELATIVE = 0; // require("./file.js") // file or directory
exports.ALIAS_AS_RESOLVABLE = 1; // require("package")
const win32 = process.platform === 'win32';
const hasURL = typeof URL !== 'undefined';
function uppercaseDriveLetter(f) {
    if (f.slice(1, 3) !== ':\\')
        return f;
    return f[0].toUpperCase() + f.slice(1);
}
function removeTrailingSlashes(f) {
    if (f === '/') {
        return f; // dont remove from "/"
    }
    if (f.slice(1) === ':\\') {
        return f; // dont remove from "D:\"
    }
    let last = f.length - 1;
    while (true) {
        const char = f.charAt(last);
        if (char === '\\') {
            f = f.slice(0, -1);
            last -= 1;
        }
        else if (char === '/') {
            f = f.slice(0, -1);
            last -= 1;
        }
        else {
            break;
        }
    }
    return f;
}
const isUrl = (p) => hasURL && p instanceof URL;
function pathToString(p, win) {
    let result;
    if (Buffer.isBuffer(p)) {
        result = p.toString();
    }
    else if (isUrl(p)) {
        result = win ? p.pathname.replace(/^\//, '') : p.pathname;
    }
    else {
        result = p;
    }
    return result;
}
function isRootPath(p) {
    let file = pathToString(p, false);
    if (file === '.') {
        file = path_1.default.resolve(file);
    }
    return path_1.default.dirname(file) === p;
}
exports.isRootPath = isRootPath;
function normalizePath(f) {
    let file = pathToString(f, win32);
    if (!/^.:$/.test(file)) {
        file = path_1.default.normalize(file);
    } // 'c:' -> 'c:.'
    if (win32) {
        file = uppercaseDriveLetter(file);
    }
    return removeTrailingSlashes(file);
}
exports.normalizePath = normalizePath;
function isPackageJson(file) {
    return path_1.default.basename(file) === 'package.json';
}
exports.isPackageJson = isPackageJson;
function isDotJS(file) {
    return path_1.default.extname(file) === '.js';
}
exports.isDotJS = isDotJS;
function isDotJSON(file) {
    return path_1.default.extname(file) === '.json';
}
exports.isDotJSON = isDotJSON;
function isDotNODE(file) {
    return path_1.default.extname(file) === '.node';
}
exports.isDotNODE = isDotNODE;
function replaceSlashes(file, slash) {
    if (/^.:\\/.test(file)) {
        if (slash === '/') {
            return file.slice(2).replace(/\\/g, '/');
        }
    }
    else if (/^\//.test(file)) {
        if (slash === '\\') {
            return `C:${file.replace(/\//g, '\\')}`;
        }
    }
    return file;
}
function injectSnapshot(file) {
    if (/^.:\\/.test(file)) {
        // C:\path\to
        if (file.length === 3) {
            // C:\
            file = file.slice(0, -1);
        }
        // by convention, on windows we use C:\\snapshot
        return `C:\\snapshot${file.slice(2)}`;
    }
    if (/^\//.test(file)) {
        // /home/user/project
        if (file.length === 1) {
            // /
            file = file.slice(0, -1);
        }
        return `/snapshot${file}`;
    }
    return file;
}
function longestCommonLength(s1, s2) {
    const length = Math.min(s1.length, s2.length);
    for (let i = 0; i < length; i += 1) {
        if (s1.charCodeAt(i) !== s2.charCodeAt(i)) {
            return i;
        }
    }
    return length;
}
function withoutNodeModules(file) {
    return file.split(`${path_1.default.sep}node_modules${path_1.default.sep}`)[0];
}
function retrieveDenominator(files) {
    (0, assert_1.default)(files.length > 0);
    let s1 = withoutNodeModules(files[0]) + path_1.default.sep;
    for (let i = 1; i < files.length; i += 1) {
        const s2 = withoutNodeModules(files[i]) + path_1.default.sep;
        s1 = s1.slice(0, longestCommonLength(s1, s2));
    }
    if (s1 === '') {
        return win32 ? 2 : 0;
    }
    return s1.lastIndexOf(path_1.default.sep);
}
exports.retrieveDenominator = retrieveDenominator;
function substituteDenominator(f, denominator) {
    const rootLength = win32 ? 2 : 0;
    return f.slice(0, rootLength) + f.slice(denominator);
}
exports.substituteDenominator = substituteDenominator;
function snapshotify(file, slash) {
    return injectSnapshot(replaceSlashes(file, slash));
}
exports.snapshotify = snapshotify;
function insideSnapshot(f) {
    f = pathToString(f, win32);
    if (typeof f !== 'string') {
        return false;
    }
    if (win32) {
        const slice112 = f.slice(1, 12);
        return (slice112 === ':\\snapshot\\' ||
            slice112 === ':/snapshot\\' ||
            slice112 === ':\\snapshot/' ||
            slice112 === ':/snapshot/' ||
            slice112 === ':\\snapshot' ||
            slice112 === ':/snapshot');
    }
    const slice010 = f.slice(0, 10);
    return slice010 === '/snapshot/' || slice010 === '/snapshot';
}
exports.insideSnapshot = insideSnapshot;
function stripSnapshot(f) {
    const file = normalizePath(f);
    if (/^.:\\snapshot$/.test(file)) {
        return `${file[0]}:\\**\\`;
    }
    if (/^.:\\snapshot\\/.test(file)) {
        return `${file[0]}:\\**${file.slice(11)}`;
    }
    if (/^\/snapshot$/.test(file)) {
        return '/**/';
    }
    if (/^\/snapshot\//.test(file)) {
        return `/**${file.slice(9)}`;
    }
    return f; // not inside
}
exports.stripSnapshot = stripSnapshot;
function removeUplevels(f) {
    if (win32) {
        while (true) {
            if (f.slice(0, 3) === '..\\') {
                f = f.slice(3);
            }
            else if (f === '..') {
                f = '.';
            }
            else {
                break;
            }
        }
        return f;
    }
    while (true) {
        if (f.slice(0, 3) === '../') {
            f = f.slice(3);
        }
        else if (f === '..') {
            f = '.';
        }
        else {
            break;
        }
    }
    return f;
}
exports.removeUplevels = removeUplevels;
function toNormalizedRealPath(requestPath) {
    const file = normalizePath(requestPath);
    if (fs_1.default.existsSync(file)) {
        return fs_1.default.realpathSync(file);
    }
    return file;
}
exports.toNormalizedRealPath = toNormalizedRealPath;
//# sourceMappingURL=common.js.map