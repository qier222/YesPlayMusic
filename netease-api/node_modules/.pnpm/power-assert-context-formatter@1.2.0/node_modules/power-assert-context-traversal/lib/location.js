'use strict';

var syntax = require('estraverse').Syntax;

function locationOf(currentNode, tokens) {
    switch(currentNode.type) {
    case syntax.MemberExpression:
        return propertyLocationOf(currentNode, tokens);
    case syntax.CallExpression:
        if (currentNode.callee.type === syntax.MemberExpression) {
            return propertyLocationOf(currentNode.callee, tokens);
        }
        break;
    case syntax.BinaryExpression:
    case syntax.LogicalExpression:
    case syntax.AssignmentExpression:
        return infixOperatorLocationOf(currentNode, tokens);
    default:
        break;
    }
    return currentNode.range;
}

function propertyLocationOf(memberExpression, tokens) {
    var prop = memberExpression.property;
    var token;
    if (!memberExpression.computed) {
        return prop.range;
    }
    token = findLeftBracketTokenOf(memberExpression, tokens);
    return token ? token.range : prop.range;
}

// calculate location of infix operator for BinaryExpression, AssignmentExpression and LogicalExpression.
function infixOperatorLocationOf (expression, tokens) {
    var token = findOperatorTokenOf(expression, tokens);
    return token ? token.range : expression.left.range;
}

function findLeftBracketTokenOf(expression, tokens) {
    var fromColumn = expression.property.range[0];
    return searchToken(tokens, function (token, index) {
        var prevToken;
        if (token.range[0] === fromColumn) {
            prevToken = tokens[index - 1];
            // if (prevToken.type === 'Punctuator' && prevToken.value === '[') {  // esprima
            if (prevToken.type.label === '[') {  // acorn
                return prevToken;
            }
        }
        return undefined;
    });
}

function findOperatorTokenOf(expression, tokens) {
    var fromColumn = expression.left.range[1];
    var toColumn = expression.right.range[0];
    return searchToken(tokens, function (token, index) {
        if (fromColumn < token.range[0] &&
            token.range[1] < toColumn &&
            token.value === expression.operator) {
            return token;
        }
        return undefined;
    });
}

function searchToken(tokens, predicate) {
    var i, token, found;
    for(i = 0; i < tokens.length; i += 1) {
        token = tokens[i];
        found = predicate(token, i);
        if (found) {
            return found;
        }
    }
    return undefined;
}

module.exports = locationOf;
