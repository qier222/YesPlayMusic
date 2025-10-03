'use strict';

var BaseRenderer = require('power-assert-renderer-base');
var inherits = require('util').inherits;
var typeName = require('type-name');
var keys = require('core-js/library/fn/object/keys');
var forEach = require('core-js/library/fn/array/for-each');
var udiff = require('./lib/udiff');
var stringifier = require('stringifier');
var assign = require('core-js/library/fn/object/assign');
var defaultOptions = require('./lib/default-options');
var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;

function isLiteral (node) {
    return literalPattern.test(node.type);
}

/**
 * options.stringify [function]
 * options.maxDepth [number]
 * options.lineSeparator [string]
 * options.anonymous [string]
 * options.circular [string]
 * 
 * options.diff [function]
 * options.lineDiffThreshold [number]
 */
function ComparisonRenderer (config) {
    BaseRenderer.call(this);
    this.config = assign({}, defaultOptions(), config);
    if (typeof this.config.stringify === 'function') {
        this.stringify = this.config.stringify;
    } else {
        this.stringify = stringifier(this.config);
    }
    if (typeof this.config.diff === 'function') {
        this.diff = this.config.diff;
    } else {
        this.diff = udiff(this.config);
    }
    this.espathToPair = {};
}
inherits(ComparisonRenderer, BaseRenderer);

ComparisonRenderer.prototype.onData = function (esNode) {
    var pair;
    if (!esNode.isCaptured) {
        if (isTargetBinaryExpression(esNode.parent) && isLiteral(esNode.node)) {
            this.espathToPair[esNode.parent.espath][esNode.key] = {code: esNode.code, value: esNode.value};
        }
        return;
    }
    if (isTargetBinaryExpression(esNode.parent)) {
        this.espathToPair[esNode.parent.espath][esNode.key] = {code: esNode.code, value: esNode.value};
    }
    if (isTargetBinaryExpression(esNode)) {
        pair = {
            operator: esNode.node.operator,
            value: esNode.value
        };
        this.espathToPair[esNode.espath] = pair;
    }
};

ComparisonRenderer.prototype.onEnd = function () {
    var _this = this;
    var pairs = [];
    forEach(keys(this.espathToPair), function (espath) {
        var pair = _this.espathToPair[espath];
        if (pair.left && pair.right) {
            pairs.push(pair);
        }
    });
    forEach(pairs, function (pair) {
        _this.compare(pair);
    });
};

ComparisonRenderer.prototype.compare = function (pair) {
    if (isStringDiffTarget(pair)) {
        this.showStringDiff(pair);
    } else {
        this.showExpectedAndActual(pair);
    }
};

ComparisonRenderer.prototype.showExpectedAndActual = function (pair) {
    this.write('');
    this.write('[' + typeName(pair.right.value) + '] ' + pair.right.code);
    this.write('=> ' + this.stringify(pair.right.value));
    this.write('[' + typeName(pair.left.value)  + '] ' + pair.left.code);
    this.write('=> ' + this.stringify(pair.left.value));
};

ComparisonRenderer.prototype.showStringDiff = function (pair) {
    this.write('');
    this.write('--- [string] ' + pair.right.code);
    this.write('+++ [string] ' + pair.left.code);
    this.write(this.diff(pair.right.value, pair.left.value, this.config));
};

function isTargetBinaryExpression (esNode) {
    return esNode &&
        esNode.node.type === 'BinaryExpression' &&
        (esNode.node.operator === '===' || esNode.node.operator === '==') &&
        esNode.isCaptured &&
        !(esNode.value);
}

function isStringDiffTarget(pair) {
    return typeof pair.left.value === 'string' && typeof pair.right.value === 'string';
}

ComparisonRenderer.udiff = udiff;
module.exports = ComparisonRenderer;
