"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remotePlace = exports.localPlace = exports.cachePath = void 0;
var semver_1 = require("semver");
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var PKG_CACHE_PATH = process.env.PKG_CACHE_PATH;
var IGNORE_TAG = Boolean(process.env.PKG_IGNORE_TAG);
exports.cachePath = PKG_CACHE_PATH || path_1.default.join(os_1.default.homedir(), '.pkg-cache');
function tagFromVersion(version) {
    var mj = (0, semver_1.major)(version);
    var mn = (0, semver_1.minor)(version);
    return "v" + mj + "." + mn;
}
function localPlace(_a) {
    var from = _a.from, output = _a.output, version = _a.version, nodeVersion = _a.nodeVersion, platform = _a.platform, arch = _a.arch;
    var binDir;
    if (output) {
        binDir = path_1.default.resolve(output);
    }
    else {
        binDir = IGNORE_TAG
            ? path_1.default.join(exports.cachePath)
            : path_1.default.join(exports.cachePath, tagFromVersion(version));
    }
    return path_1.default.resolve(binDir, (output ? 'node' : from) + "-" + nodeVersion + "-" + platform + "-" + arch);
}
exports.localPlace = localPlace;
function remotePlace(_a) {
    var version = _a.version, nodeVersion = _a.nodeVersion, platform = _a.platform, arch = _a.arch;
    return {
        tag: tagFromVersion(version),
        name: "node-" + nodeVersion + "-" + platform + "-" + arch,
    };
}
exports.remotePlace = remotePlace;
//# sourceMappingURL=places.js.map