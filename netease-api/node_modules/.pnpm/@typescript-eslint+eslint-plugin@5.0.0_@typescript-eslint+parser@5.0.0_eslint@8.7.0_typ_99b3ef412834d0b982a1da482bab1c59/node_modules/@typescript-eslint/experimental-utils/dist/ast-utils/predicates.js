"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVariableDeclarator = exports.isTypeAssertion = exports.isTSFunctionType = exports.isTSConstructorType = exports.isSetter = exports.isOptionalCallExpression = exports.isOptionalChainPunctuator = exports.isNotOptionalChainPunctuator = exports.isNotNonNullAssertionPunctuator = exports.isNonNullAssertionPunctuator = exports.isLogicalOrOperator = exports.isLoop = exports.isIdentifier = exports.isFunctionType = exports.isFunctionOrFunctionType = exports.isFunction = exports.isClassOrTypeElement = exports.isConstructor = exports.isAwaitKeyword = exports.isAwaitExpression = void 0;
const ts_estree_1 = require("../ts-estree");
const isNodeOfType = (nodeType) => (node) => (node === null || node === void 0 ? void 0 : node.type) === nodeType;
const isNodeOfTypes = (nodeTypes) => (node) => !!node && nodeTypes.includes(node.type);
const isNodeOfTypeWithConditions = (nodeType, conditions) => {
    const entries = Object.entries(conditions);
    return (node) => (node === null || node === void 0 ? void 0 : node.type) === nodeType &&
        entries.every(([key, value]) => node[key] === value);
};
function isOptionalChainPunctuator(token) {
    return token.type === ts_estree_1.AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
exports.isOptionalChainPunctuator = isOptionalChainPunctuator;
function isNotOptionalChainPunctuator(token) {
    return !isOptionalChainPunctuator(token);
}
exports.isNotOptionalChainPunctuator = isNotOptionalChainPunctuator;
function isNonNullAssertionPunctuator(token) {
    return token.type === ts_estree_1.AST_TOKEN_TYPES.Punctuator && token.value === '!';
}
exports.isNonNullAssertionPunctuator = isNonNullAssertionPunctuator;
function isNotNonNullAssertionPunctuator(token) {
    return !isNonNullAssertionPunctuator(token);
}
exports.isNotNonNullAssertionPunctuator = isNotNonNullAssertionPunctuator;
/**
 * Returns true if and only if the node represents: foo?.() or foo.bar?.()
 */
const isOptionalCallExpression = isNodeOfTypeWithConditions(ts_estree_1.AST_NODE_TYPES.CallExpression, 
// this flag means the call expression itself is option
// i.e. it is foo.bar?.() and not foo?.bar()
{ optional: true });
exports.isOptionalCallExpression = isOptionalCallExpression;
/**
 * Returns true if and only if the node represents logical OR
 */
const isLogicalOrOperator = isNodeOfTypeWithConditions(ts_estree_1.AST_NODE_TYPES.LogicalExpression, { operator: '||' });
exports.isLogicalOrOperator = isLogicalOrOperator;
/**
 * Checks if a node is a type assertion:
 * ```
 * x as foo
 * <foo>x
 * ```
 */
const isTypeAssertion = isNodeOfTypes([
    ts_estree_1.AST_NODE_TYPES.TSAsExpression,
    ts_estree_1.AST_NODE_TYPES.TSTypeAssertion,
]);
exports.isTypeAssertion = isTypeAssertion;
const isVariableDeclarator = isNodeOfType(ts_estree_1.AST_NODE_TYPES.VariableDeclarator);
exports.isVariableDeclarator = isVariableDeclarator;
const functionTypes = [
    ts_estree_1.AST_NODE_TYPES.ArrowFunctionExpression,
    ts_estree_1.AST_NODE_TYPES.FunctionDeclaration,
    ts_estree_1.AST_NODE_TYPES.FunctionExpression,
];
const isFunction = isNodeOfTypes(functionTypes);
exports.isFunction = isFunction;
const functionTypeTypes = [
    ts_estree_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
    ts_estree_1.AST_NODE_TYPES.TSConstructorType,
    ts_estree_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
    ts_estree_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
    ts_estree_1.AST_NODE_TYPES.TSFunctionType,
    ts_estree_1.AST_NODE_TYPES.TSMethodSignature,
];
const isFunctionType = isNodeOfTypes(functionTypeTypes);
exports.isFunctionType = isFunctionType;
const isFunctionOrFunctionType = isNodeOfTypes([
    ...functionTypes,
    ...functionTypeTypes,
]);
exports.isFunctionOrFunctionType = isFunctionOrFunctionType;
const isTSFunctionType = isNodeOfType(ts_estree_1.AST_NODE_TYPES.TSFunctionType);
exports.isTSFunctionType = isTSFunctionType;
const isTSConstructorType = isNodeOfType(ts_estree_1.AST_NODE_TYPES.TSConstructorType);
exports.isTSConstructorType = isTSConstructorType;
const isClassOrTypeElement = isNodeOfTypes([
    // ClassElement
    ts_estree_1.AST_NODE_TYPES.PropertyDefinition,
    ts_estree_1.AST_NODE_TYPES.FunctionExpression,
    ts_estree_1.AST_NODE_TYPES.MethodDefinition,
    ts_estree_1.AST_NODE_TYPES.TSAbstractPropertyDefinition,
    ts_estree_1.AST_NODE_TYPES.TSAbstractMethodDefinition,
    ts_estree_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
    ts_estree_1.AST_NODE_TYPES.TSIndexSignature,
    // TypeElement
    ts_estree_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
    ts_estree_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
    // AST_NODE_TYPES.TSIndexSignature,
    ts_estree_1.AST_NODE_TYPES.TSMethodSignature,
    ts_estree_1.AST_NODE_TYPES.TSPropertySignature,
]);
exports.isClassOrTypeElement = isClassOrTypeElement;
/**
 * Checks if a node is a constructor method.
 */
const isConstructor = isNodeOfTypeWithConditions(ts_estree_1.AST_NODE_TYPES.MethodDefinition, { kind: 'constructor' });
exports.isConstructor = isConstructor;
/**
 * Checks if a node is a setter method.
 */
function isSetter(node) {
    return (!!node &&
        (node.type === ts_estree_1.AST_NODE_TYPES.MethodDefinition ||
            node.type === ts_estree_1.AST_NODE_TYPES.Property) &&
        node.kind === 'set');
}
exports.isSetter = isSetter;
const isIdentifier = isNodeOfType(ts_estree_1.AST_NODE_TYPES.Identifier);
exports.isIdentifier = isIdentifier;
/**
 * Checks if a node represents an `await …` expression.
 */
const isAwaitExpression = isNodeOfType(ts_estree_1.AST_NODE_TYPES.AwaitExpression);
exports.isAwaitExpression = isAwaitExpression;
/**
 * Checks if a possible token is the `await` keyword.
 */
function isAwaitKeyword(node) {
    return (node === null || node === void 0 ? void 0 : node.type) === ts_estree_1.AST_TOKEN_TYPES.Identifier && node.value === 'await';
}
exports.isAwaitKeyword = isAwaitKeyword;
const isLoop = isNodeOfTypes([
    ts_estree_1.AST_NODE_TYPES.DoWhileStatement,
    ts_estree_1.AST_NODE_TYPES.ForStatement,
    ts_estree_1.AST_NODE_TYPES.ForInStatement,
    ts_estree_1.AST_NODE_TYPES.ForOfStatement,
    ts_estree_1.AST_NODE_TYPES.WhileStatement,
]);
exports.isLoop = isLoop;
//# sourceMappingURL=predicates.js.map