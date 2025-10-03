'use strict';

var estraverse = require('estraverse');
var syntax = estraverse.Syntax;
var supportedNodeTypes = require('./supported-node-types');

function isLeftHandSideOfAssignment(parentNode, currentKey) {
    // Do not instrument left due to 'Invalid left-hand side in assignment'
    return parentNode.type === syntax.AssignmentExpression && currentKey === 'left';
}

function isChildOfObjectLiteral (parentNode) {
    return parentNode.type === syntax.Property && parentNode.kind === 'init';
}

function isObjectLiteralKey (parentNode, currentKey) {
    return isChildOfObjectLiteral(parentNode) && currentKey === 'key';
}

function isObjectLiteralValue (parentNode, currentKey) {
    return isChildOfObjectLiteral(parentNode) && currentKey === 'value';
}

function isNonComputedObjectLiteralKey(parentNode, currentKey) {
    // Do not instrument non-computed Object literal key
    return isObjectLiteralKey(parentNode, currentKey) && !parentNode.computed;
}

function isShorthandedValueOfObjectLiteral(parentNode, currentKey) {
    // Do not instrument shorthanded Object literal value
    return isObjectLiteralValue(parentNode, currentKey) && parentNode.shorthand;
}

function isUpdateExpression(parentNode) {
    // Just wrap UpdateExpression, not digging in.
    return parentNode.type === syntax.UpdateExpression;
}

function isCallExpressionWithNonComputedMemberExpression(currentNode, parentNode, currentKey) {
    // Do not instrument non-computed property of MemberExpression within CallExpression.
    return currentNode.type === syntax.Identifier && parentNode.type === syntax.MemberExpression && !parentNode.computed && currentKey === 'property';
}

function isTypeOfOrDeleteUnaryExpression(currentNode, parentNode, currentKey) {
    // 'typeof Identifier' or 'delete Identifier' is not instrumented
    return currentNode.type === syntax.Identifier && parentNode.type === syntax.UnaryExpression && (parentNode.operator === 'typeof' || parentNode.operator === 'delete') && currentKey === 'argument';
}

function isSupportedNodeType (node) {
    return supportedNodeTypes.indexOf(node.type) !== -1;
}

module.exports = function toBeSkipped (currentNode, parentNode, currentKey) {
    return !isSupportedNodeType(currentNode) ||
        isLeftHandSideOfAssignment(parentNode, currentKey) ||
        isNonComputedObjectLiteralKey(parentNode, currentKey) ||
        isShorthandedValueOfObjectLiteral(parentNode, currentKey) ||
        isUpdateExpression(parentNode) ||
        isCallExpressionWithNonComputedMemberExpression(currentNode, parentNode, currentKey) ||
        isTypeOfOrDeleteUnaryExpression(currentNode, parentNode, currentKey);
};
