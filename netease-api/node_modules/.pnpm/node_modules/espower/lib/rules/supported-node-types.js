'use strict';

var estraverse = require('estraverse');
var syntax = estraverse.Syntax;

module.exports = [
    syntax.Identifier,
    syntax.MemberExpression,
    syntax.CallExpression,
    syntax.UnaryExpression,
    syntax.BinaryExpression,
    syntax.LogicalExpression,
    syntax.AssignmentExpression,
    syntax.ObjectExpression,
    syntax.NewExpression,
    syntax.ArrayExpression,
    syntax.ConditionalExpression,
    syntax.UpdateExpression,
    syntax.SequenceExpression,
    syntax.TemplateLiteral,
    syntax.TaggedTemplateExpression,
    syntax.SpreadElement,
    syntax.YieldExpression,
    syntax.AwaitExpression,
    syntax.Property
];
