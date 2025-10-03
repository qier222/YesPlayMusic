"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const getESLintCoreRule_1 = require("../util/getESLintCoreRule");
const util_1 = require("../util");
const baseRule = (0, getESLintCoreRule_1.getESLintCoreRule)('init-declarations');
exports.default = (0, util_1.createRule)({
    name: 'init-declarations',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'require or disallow initialization in variable declarations',
            recommended: false,
            extendsBaseRule: true,
        },
        hasSuggestions: baseRule.meta.hasSuggestions,
        schema: baseRule.meta.schema,
        messages: baseRule.meta.messages,
    },
    defaultOptions: ['always'],
    create(context) {
        const rules = baseRule.create(context);
        const mode = context.options[0] || 'always';
        return {
            'VariableDeclaration:exit'(node) {
                var _a, _b, _c;
                if (mode === 'always') {
                    if (node.declare) {
                        return;
                    }
                    if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.TSModuleBlock &&
                        ((_b = node.parent.parent) === null || _b === void 0 ? void 0 : _b.type) === experimental_utils_1.AST_NODE_TYPES.TSModuleDeclaration &&
                        ((_c = node.parent.parent) === null || _c === void 0 ? void 0 : _c.declare)) {
                        return;
                    }
                }
                rules['VariableDeclaration:exit'](node);
            },
        };
    },
});
//# sourceMappingURL=init-declarations.js.map