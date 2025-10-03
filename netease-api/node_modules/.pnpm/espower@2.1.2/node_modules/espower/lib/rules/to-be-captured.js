'use strict';

var estraverse = require('estraverse');
var syntax = estraverse.Syntax;
var caputuringTargetTypes = [
    // syntax.Property,
    syntax.ObjectExpression,
    syntax.ArrayExpression,
    // syntax.ConditionalExpression,
    syntax.Identifier,
    syntax.MemberExpression,
    syntax.CallExpression,
    syntax.UnaryExpression,
    syntax.BinaryExpression,
    syntax.LogicalExpression,
    syntax.AssignmentExpression,
    syntax.NewExpression,
    syntax.UpdateExpression,
    syntax.YieldExpression,
    syntax.AwaitExpression,
    syntax.TemplateLiteral,
    syntax.TaggedTemplateExpression
];

function isCaputuringTargetType (currentNode) {
    return caputuringTargetTypes.indexOf(currentNode.type) !== -1;
}

function isCalleeOfParent(parentNode, currentKey) {
    return (parentNode.type === syntax.CallExpression || parentNode.type === syntax.NewExpression) && currentKey === 'callee';
}

function isChildOfTaggedTemplateExpression(parentNode) {
    return parentNode.type === syntax.TaggedTemplateExpression;
}

function isYieldOrAwaitArgument(parentNode, currentKey) {
    // capture the yielded/await result, not the promise
    return (parentNode.type === syntax.YieldExpression || parentNode.type === syntax.AwaitExpression) && currentKey === 'argument';
}

module.exports = function toBeCaptured (currentNode, parentNode, currentKey) {
    return isCaputuringTargetType(currentNode) &&
        !isYieldOrAwaitArgument(parentNode, currentKey) &&
        !isCalleeOfParent(parentNode, currentKey) &&
        !isChildOfTaggedTemplateExpression(parentNode);
};
