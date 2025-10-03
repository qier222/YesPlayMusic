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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
var child_process_1 = require("child_process");
var utils_1 = require("./utils");
var script = "\n  var vm = require('vm');\n  var assert = require('assert');\n  var text = '(function () { return 42; })';\n  var cd, fn, result;\n  var modules = process.versions.modules | 0;\n  var v8 = process.versions.v8.split('.').slice(0, 2).join('.');\n\n  var s1 = new vm.Script(text, { filename: 's1', produceCachedData: true, sourceless: true });\n  assert(s1.cachedDataProduced);\n  cd = s1.cachedData;\n\n  var kCpuFeaturesOffset, cpuFeatures;\n\n  if (modules === 14) {\n  } else\n  if (modules === 46 || modules === 48 || modules === 51) {\n    kCpuFeaturesOffset = 0x0c;\n  } else\n  if (modules === 57) {\n    if (v8 === '6.2') {\n      kCpuFeaturesOffset = 0x0c;\n    } else\n    if (v8 === '5.8') {\n      kCpuFeaturesOffset = 0x0c;\n    } else {\n      kCpuFeaturesOffset = 0x10;\n    }\n  } else\n  if (modules === 59) {\n    kCpuFeaturesOffset = 0x0c;\n  } else\n  if (modules === 64) {\n    kCpuFeaturesOffset = 0x0c;\n  } else\n  if (modules === 72) {\n    // no cpu features anymore\n  } else\n  if (modules === 79) {\n    // no cpu features anymore\n  } else\n  if (modules === 83) {\n    // no cpu features anymore\n  } else {\n    assert(false, modules);\n  }\n\n  if (modules >= 46 && // no cpu_features field in 0.12\n      process.arch !== 'arm' && // non-zero features even in sourceless mode in arm\n      modules < 72) { // no cpu_features field in 12+\n    cpuFeatures = cd.readUInt32LE(kCpuFeaturesOffset);\n    assert(cpuFeatures === 0, 'CPU_FEATURES must be zero');\n  }\n\n  var s2 = new vm.Script(undefined, { filename: 's2', cachedData: cd, sourceless: true });\n  fn = s2.runInThisContext();\n  result = fn();\n  assert.equal(result, 42);\n\n  if (modules === 14) {\n  } else\n  if (modules === 46 || modules === 48 ||\n      modules === 51 || modules === 57 || modules === 59 || modules === 64) {\n    var paddedPayloadOffset = 0x48; // see SerializedCodeData::Payload()\n    var index = paddedPayloadOffset + 10;\n    cd[index] ^= 0xf0;\n    var s3 = new vm.Script(undefined, { filename: 's3', cachedData: cd, sourceless: true });\n    assert(s3.cachedDataRejected, 's3.cachedDataRejected must be true');\n  } else\n  if (modules === 72) {\n  } else\n  if (modules === 79) {\n  } else\n  if (modules === 83) {\n  } else {\n    assert(false, modules);\n  }\n\n  var s4 = new vm.Script(text, { filename: 's4', produceCachedData: true });\n  assert(s4.cachedDataProduced, 's4.cachedDataProduced must be true');\n  cd = s4.cachedData;\n\n  if (modules >= 46 && // no cpu_features field in 0.12\n      process.arch !== 'arm' && // zero features even in non-sourceless mode in arm\n      modules < 72) { // no cpu_features field in 12+\n    cpuFeatures = cd.readUInt32LE(kCpuFeaturesOffset);\n    assert(cpuFeatures !== 0, 'CPU_FEATURES must be non-zero');\n  }\n\n  console.log('ok');\n";
function verify(local) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, utils_1.plusx)(local)];
                case 1:
                    _a.sent();
                    (0, child_process_1.spawnSync)(local, ['-e', script], {
                        env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' },
                        stdio: 'inherit',
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.verify = verify;
//# sourceMappingURL=verify.js.map