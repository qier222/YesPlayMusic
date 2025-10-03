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
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeGetESLintCoreRule = exports.getESLintCoreRule = void 0;
const package_json_1 = require("eslint/package.json");
const semver = __importStar(require("semver"));
const nullThrows_1 = require("./nullThrows");
const isESLintV8 = semver.major(package_json_1.version) >= 8;
exports.getESLintCoreRule = isESLintV8
    ? (ruleId) => (0, nullThrows_1.nullThrows)(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    require('eslint/use-at-your-own-risk').builtinRules.get(ruleId), `ESLint's core rule '${ruleId}' not found.`)
    : (ruleId) => require(`eslint/lib/rules/${ruleId}`);
function maybeGetESLintCoreRule(ruleId) {
    try {
        return (0, exports.getESLintCoreRule)(ruleId);
    }
    catch (_a) {
        return null;
    }
}
exports.maybeGetESLintCoreRule = maybeGetESLintCoreRule;
//# sourceMappingURL=getESLintCoreRule.js.map