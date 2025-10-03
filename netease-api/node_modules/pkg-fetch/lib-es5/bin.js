#!/usr/bin/env node
"use strict";
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
var yargs_1 = __importDefault(require("yargs"));
var system_1 = require("./system");
var log_1 = require("./log");
var index_1 = require("./index");
var verify_1 = require("./verify");
var package_json_1 = require("../package.json");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, nodeRange, platform, arch, test, forceFetch, forceBuild, output, local;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    argv = yargs_1.default
                        .env('PKG_FETCH_OPTION_')
                        .option('node-range', { alias: 'n', default: 'latest', type: 'string' })
                        .option('platform', { alias: 'p', default: system_1.hostPlatform, type: 'string' })
                        .option('arch', { alias: 'a', default: system_1.hostArch, type: 'string' })
                        .option('test', { alias: 't', type: 'boolean' })
                        .option('force-fetch', {
                        alias: 'f',
                        type: 'boolean',
                    })
                        .option('force-build', {
                        alias: 'b',
                        type: 'boolean',
                    })
                        .conflicts('force-fetch', 'force-build')
                        .option('output', { alias: 'o', type: 'string' })
                        .version(package_json_1.version)
                        .alias('v', 'version')
                        .help()
                        .alias('h', 'help').argv;
                    nodeRange = argv["node-range"], platform = argv.platform, arch = argv.arch, test = argv.test, forceFetch = argv["force-fetch"], forceBuild = argv["force-build"], output = argv.output;
                    return [4 /*yield*/, (0, index_1.need)({
                            nodeRange: nodeRange,
                            platform: platform,
                            arch: arch,
                            forceFetch: forceFetch,
                            forceBuild: forceBuild,
                            output: output,
                        })];
                case 1:
                    local = _a.sent();
                    log_1.log.info(local);
                    if (!test) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, verify_1.verify)(local)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    if (!error.wasReported)
        log_1.log.error(error);
    process.exit(2);
});
//# sourceMappingURL=bin.js.map