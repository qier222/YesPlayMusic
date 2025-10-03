/**
 * call-matcher:
 *   ECMAScript CallExpression matcher made from function/method signature
 * 
 * https://github.com/twada/call-matcher
 *
 * Copyright (c) 2015-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/call-matcher/blob/master/MIT-LICENSE.txt
 */
'use strict';
/* jshint -W024 */

var estraverse = require('estraverse');
var espurify = require('espurify');
var syntax = estraverse.Syntax;
var hasOwn = Object.prototype.hasOwnProperty;
var forEach = require('core-js/library/fn/array/for-each');
var map = require('core-js/library/fn/array/map');
var filter = require('core-js/library/fn/array/filter');
var reduce = require('core-js/library/fn/array/reduce');
var indexOf = require('core-js/library/fn/array/index-of');
var deepEqual = require('deep-equal');
var notCallExprMessage = 'Argument should be in the form of CallExpression';
var duplicatedArgMessage = 'Duplicate argument name: ';
var invalidFormMessage = 'Argument should be in the form of `name` or `[name]`';

function CallMatcher (signatureAst, options) {
    validateApiExpression(signatureAst);
    options = options || {};
    this.visitorKeys = options.visitorKeys || estraverse.VisitorKeys;
    if (options.astWhiteList) {
        this.purifyAst = espurify.cloneWithWhitelist(options.astWhiteList);
    } else {
        this.purifyAst = espurify;
    }
    this.signatureAst = signatureAst;
    this.signatureCalleeDepth = astDepth(signatureAst.callee, this.visitorKeys);
    this.numMaxArgs = this.signatureAst.arguments.length;
    this.numMinArgs = filter(this.signatureAst.arguments, identifiers).length;
}

CallMatcher.prototype.test = function (currentNode) {
    var calleeMatched = this.isCalleeMatched(currentNode);
    var numArgs;
    if (calleeMatched) {
        numArgs = currentNode.arguments.length;
        return this.numMinArgs <= numArgs && numArgs <= this.numMaxArgs;
    }
    return false;
};

CallMatcher.prototype.matchArgument = function (currentNode, parentNode) {
    if (isCalleeOfParent(currentNode, parentNode)) {
        return null;
    }
    if (this.test(parentNode)) {
        var indexOfCurrentArg = indexOf(parentNode.arguments, currentNode);
        var numOptional = parentNode.arguments.length - this.numMinArgs;
        var matchedSignatures = reduce(this.argumentSignatures(), function (accum, argSig) {
            if (argSig.kind === 'mandatory') {
                accum.push(argSig);
            }
            if (argSig.kind === 'optional' && 0 < numOptional) {
                numOptional -= 1;
                accum.push(argSig);
            }
            return accum;
        }, []);
        return matchedSignatures[indexOfCurrentArg];
    }
    return null;
};

CallMatcher.prototype.calleeAst = function () {
    return this.purifyAst(this.signatureAst.callee);
};

CallMatcher.prototype.argumentSignatures = function () {
    return map(this.signatureAst.arguments, toArgumentSignature);
};

CallMatcher.prototype.isCalleeMatched = function (node) {
    if (!isCallExpression(node)) {
        return false;
    }
    if (!this.isSameDepthAsSignatureCallee(node.callee)) {
        return false;
    }
    return deepEqual(this.purifyAst(this.signatureAst.callee), this.purifyAst(node.callee));
};

CallMatcher.prototype.isSameDepthAsSignatureCallee = function (ast) {
    var depth = this.signatureCalleeDepth;
    var currentDepth = 0;
    estraverse.traverse(ast, {
        keys: this.visitorKeys,
        enter: function (currentNode, parentNode) {
            var path = this.path();
            var pathDepth = path ? path.length : 0;
            if (currentDepth < pathDepth) {
                currentDepth = pathDepth;
            }
            if (depth < currentDepth) {
                this['break']();
            }
        }
    });
    return (depth === currentDepth);
};

function toArgumentSignature (argSignatureNode, idx) {
    switch(argSignatureNode.type) {
    case syntax.Identifier:
        return {
            index: idx,
            name: argSignatureNode.name,
            kind: 'mandatory'
        };
    case syntax.ArrayExpression:
        return {
            index: idx,
            name: argSignatureNode.elements[0].name,
            kind: 'optional'
        };
    default:
        return null;
    }
}

function astDepth (ast, visitorKeys) {
    var maxDepth = 0;
    estraverse.traverse(ast, {
        keys: visitorKeys,
        enter: function (currentNode, parentNode) {
            var path = this.path();
            var pathDepth = path ? path.length : 0;
            if (maxDepth < pathDepth) {
                maxDepth = pathDepth;
            }
        }
    });
    return maxDepth;
}

function isCallExpression (node) {
    return node && node.type === syntax.CallExpression;
}

function isCalleeOfParent(currentNode, parentNode) {
    return parentNode && currentNode &&
        parentNode.type === syntax.CallExpression &&
        parentNode.callee === currentNode;
}

function identifiers (node) {
    return node.type === syntax.Identifier;
}

function validateApiExpression (callExpression) {
    if (!callExpression || !callExpression.type) {
        throw new Error(notCallExprMessage);
    }
    if (callExpression.type !== syntax.CallExpression) {
        throw new Error(notCallExprMessage);
    }
    var names = {};
    forEach(callExpression.arguments, function (arg) {
        var name = validateArg(arg);
        if (hasOwn.call(names, name)) {
            throw new Error(duplicatedArgMessage + name);
        } else {
            names[name] = name;
        }
    });
}

function validateArg (arg) {
    var inner;
    switch(arg.type) {
    case syntax.Identifier:
        return arg.name;
    case syntax.ArrayExpression:
        if (arg.elements.length !== 1) {
            throw new Error(invalidFormMessage);
        }
        inner = arg.elements[0];
        if (inner.type !== syntax.Identifier) {
            throw new Error(invalidFormMessage);
        }
        return inner.name;
    default:
        throw new Error(invalidFormMessage);
    }
}

module.exports = CallMatcher;
