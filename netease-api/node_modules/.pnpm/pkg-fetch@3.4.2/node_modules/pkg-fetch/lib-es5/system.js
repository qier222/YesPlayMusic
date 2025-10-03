"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knownArchs = exports.targetArchs = exports.hostArch = exports.knownPlatforms = exports.hostPlatform = exports.hostAbi = exports.toFancyArch = exports.toFancyPlatform = exports.isValidNodeRange = exports.abiToNodeRange = void 0;
var fs_1 = __importDefault(require("fs"));
var child_process_1 = require("child_process");
function getHostAbi() {
    return "m" + process.versions.modules;
}
function abiToNodeRange(abi) {
    if (/^m?14/.test(abi))
        return 'node0.12';
    if (/^m?46/.test(abi))
        return 'node4';
    if (/^m?47/.test(abi))
        return 'node5';
    if (/^m?48/.test(abi))
        return 'node6';
    if (/^m?51/.test(abi))
        return 'node7';
    if (/^m?57/.test(abi))
        return 'node8';
    if (/^m?59/.test(abi))
        return 'node9';
    if (/^m?64/.test(abi))
        return 'node10';
    if (/^m?67/.test(abi))
        return 'node11';
    if (/^m?72/.test(abi))
        return 'node12';
    if (/^m?79/.test(abi))
        return 'node13';
    if (/^m?83/.test(abi))
        return 'node14';
    return abi;
}
exports.abiToNodeRange = abiToNodeRange;
function isValidNodeRange(nodeRange) {
    if (nodeRange === 'latest')
        return true;
    if (!/^node/.test(nodeRange))
        return false;
    return true;
}
exports.isValidNodeRange = isValidNodeRange;
function toFancyPlatform(platform) {
    if (platform === 'darwin')
        return 'macos';
    if (platform === 'lin')
        return 'linux';
    if (platform === 'mac')
        return 'macos';
    if (platform === 'osx')
        return 'macos';
    if (platform === 'win32')
        return 'win';
    if (platform === 'windows')
        return 'win';
    return platform;
}
exports.toFancyPlatform = toFancyPlatform;
function detectAlpine() {
    var _a;
    var platform = process.platform;
    if (platform !== 'linux') {
        return false;
    }
    // https://github.com/sass/node-sass/issues/1589#issuecomment-265292579
    var ldd = (_a = (0, child_process_1.spawnSync)('ldd').stderr) === null || _a === void 0 ? void 0 : _a.toString();
    if (ldd == null) {
        return fs_1.default.readdirSync('/lib').some(function (file) { return file.startsWith('libc.musl'); });
    }
    if (/\bmusl\b/.test(ldd)) {
        return true;
    }
    var lddNode = (0, child_process_1.spawnSync)('ldd', [process.execPath]).stdout.toString();
    return /\bmusl\b/.test(lddNode);
}
var isAlpine = detectAlpine();
function getHostPlatform() {
    var platform = process.platform;
    if (isAlpine) {
        return 'alpine';
    }
    return toFancyPlatform(platform);
}
function getKnownPlatforms() {
    return ['alpine', 'freebsd', 'linux', 'linuxstatic', 'macos', 'win'];
}
function toFancyArch(arch) {
    if (arch === 'arm')
        return 'armv7';
    if (arch === 'ia32')
        return 'x86';
    if (arch === 'x86_64')
        return 'x64';
    return arch;
}
exports.toFancyArch = toFancyArch;
function getHostArch() {
    return toFancyArch(process.arch);
}
function getTargetArchs() {
    var arch = getHostArch();
    if (arch === 'x64') {
        return ['x64', 'x86'];
    }
    return [arch];
}
function getKnownArchs() {
    return ['x64', 'x86', 'armv7', 'arm64', 'ppc64', 's390x'];
}
exports.hostAbi = getHostAbi();
exports.hostPlatform = getHostPlatform();
exports.knownPlatforms = getKnownPlatforms();
exports.hostArch = getHostArch();
exports.targetArchs = getTargetArchs();
exports.knownArchs = getKnownArchs();
//# sourceMappingURL=system.js.map