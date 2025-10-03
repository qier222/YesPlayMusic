"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.system = exports.need = void 0;
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var semver_1 = __importDefault(require("semver"));
var expected_1 = require("./expected");
var system_1 = require("./system");
var system = __importStar(require("./system"));
exports.system = system;
var places_1 = require("./places");
var log_1 = require("./log");
var build_1 = __importDefault(require("./build"));
var utils_1 = require("./utils");
var patches_json_1 = __importDefault(require("../patches/patches.json"));
var package_json_1 = require("../package.json");
function download(_a, local) {
    var tag = _a.tag, name = _a.name;
    return __awaiter(this, void 0, void 0, function () {
        var url, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = "https://github.com/vercel/pkg-fetch/releases/download/" + tag + "/" + name;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, utils_1.downloadUrl)(url, local)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, utils_1.plusx)(local)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _b = _c.sent();
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
function exists(file) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs_extra_1.default.stat(file)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function need(opts) {
    return __awaiter(this, void 0, void 0, function () {
        function satisfyingNodeVersion() {
            var versions = Object.keys(patches_json_1.default)
                .filter(function (nv) { return semver_1.default.satisfies(nv, nodeRange) || nodeRange === 'latest'; })
                .sort(function (nv1, nv2) { return (semver_1.default.gt(nv1, nv2) ? 1 : -1); });
            return versions.pop();
        }
        var _a, forceFetch, forceBuild, dryRun, output, _b, nodeRange, platform, arch, nodeVersion, fetched, built, remote, fetchFailed;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = opts || {}, forceFetch = _a.forceFetch, forceBuild = _a.forceBuild, dryRun = _a.dryRun, output = _a.output;
                    _b = opts || {}, nodeRange = _b.nodeRange, platform = _b.platform, arch = _b.arch;
                    if (!nodeRange)
                        throw (0, log_1.wasReported)('nodeRange not specified');
                    if (!platform)
                        throw (0, log_1.wasReported)('platform not specified');
                    if (!arch)
                        throw (0, log_1.wasReported)('arch not specified');
                    nodeRange = (0, system_1.abiToNodeRange)(nodeRange); // 'm48' -> 'node6'
                    if (!(0, system_1.isValidNodeRange)(nodeRange)) {
                        throw (0, log_1.wasReported)("nodeRange must start with 'node'");
                    }
                    if (nodeRange !== 'latest') {
                        nodeRange = "v" + nodeRange.slice(4); // 'node6' -> 'v6' for semver
                    }
                    platform = (0, system_1.toFancyPlatform)(platform); // win32 -> win
                    arch = (0, system_1.toFancyArch)(arch); // ia32 -> x86
                    nodeVersion = satisfyingNodeVersion();
                    if (!nodeVersion) {
                        throw (0, log_1.wasReported)("No available node version satisfies '" + opts.nodeRange + "'");
                    }
                    fetched = (0, places_1.localPlace)({
                        from: 'fetched',
                        arch: arch,
                        nodeVersion: nodeVersion,
                        platform: platform,
                        version: package_json_1.version,
                        output: output,
                    });
                    built = (0, places_1.localPlace)({
                        from: 'built',
                        arch: arch,
                        nodeVersion: nodeVersion,
                        platform: platform,
                        version: package_json_1.version,
                        output: output,
                    });
                    remote = (0, places_1.remotePlace)({ arch: arch, nodeVersion: nodeVersion, platform: platform, version: package_json_1.version });
                    if (!!forceBuild) return [3 /*break*/, 3];
                    return [4 /*yield*/, exists(fetched)];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 3];
                    if (dryRun) {
                        return [2 /*return*/, 'exists'];
                    }
                    return [4 /*yield*/, (0, utils_1.hash)(fetched)];
                case 2:
                    if ((_c.sent()) === expected_1.EXPECTED_HASHES[remote.name]) {
                        return [2 /*return*/, fetched];
                    }
                    log_1.log.info('Binary hash does NOT match. Re-fetching...');
                    fs_extra_1.default.unlinkSync(fetched);
                    _c.label = 3;
                case 3:
                    if (!!forceFetch) return [3 /*break*/, 5];
                    return [4 /*yield*/, exists(built)];
                case 4:
                    if (_c.sent()) {
                        if (dryRun)
                            return [2 /*return*/, 'exists'];
                        if (forceBuild)
                            log_1.log.info('Reusing base binaries built locally:', built);
                        return [2 /*return*/, built];
                    }
                    _c.label = 5;
                case 5:
                    if (!!forceBuild) return [3 /*break*/, 9];
                    if (dryRun)
                        return [2 /*return*/, 'fetched'];
                    return [4 /*yield*/, download(remote, fetched)];
                case 6:
                    if (!_c.sent()) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, utils_1.hash)(fetched)];
                case 7:
                    if ((_c.sent()) === expected_1.EXPECTED_HASHES[remote.name]) {
                        return [2 /*return*/, fetched];
                    }
                    fs_extra_1.default.unlinkSync(fetched);
                    throw (0, log_1.wasReported)('Binary hash does NOT match.');
                case 8:
                    fetchFailed = true;
                    _c.label = 9;
                case 9:
                    if (!dryRun && fetchFailed) {
                        log_1.log.info('Not found in remote cache:', JSON.stringify(remote));
                        if (forceFetch) {
                            throw (0, log_1.wasReported)("Failed to fetch.");
                        }
                    }
                    if (!dryRun) {
                        log_1.log.info('Building base binary from source:', path_1.default.basename(built));
                    }
                    if (system_1.hostPlatform !== platform) {
                        if (system_1.hostPlatform !== 'alpine' || platform !== 'linuxstatic') {
                            throw (0, log_1.wasReported)("Not able to build for '" + opts.platform + "' here, only for '" + system_1.hostPlatform + "'");
                        }
                    }
                    if (system_1.knownArchs.indexOf(arch) < 0) {
                        throw (0, log_1.wasReported)("Unknown arch '" + opts.arch + "'. Specify " + system_1.knownArchs.join(', '));
                    }
                    if (dryRun) {
                        return [2 /*return*/, 'built'];
                    }
                    return [4 /*yield*/, (0, build_1.default)(nodeVersion, arch, platform, built)];
                case 10:
                    _c.sent();
                    return [2 /*return*/, built];
            }
        });
    });
}
exports.need = need;
//# sourceMappingURL=index.js.map