'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var estraverse = require('estraverse');
var forEach = require('core-js/library/fn/array/for-each');
var reduce = require('core-js/library/fn/array/reduce');
var locationOf = require('./location');
var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
var assign = require('core-js/library/fn/object/assign');

function ContextTraversal (powerAssertContext) {
    this.powerAssertContext = powerAssertContext;
    EventEmitter.call(this);
}
inherits(ContextTraversal, EventEmitter);

ContextTraversal.prototype.traverse = function () {
    var _this = this;
    var source = _this.powerAssertContext.source;
    parseIfJson(source, 'ast');
    parseIfJson(source, 'tokens');
    parseIfJson(source, 'visitorKeys');
    _this.emit('start', this.powerAssertContext);
    forEach(this.powerAssertContext.args, function (capturedArgument) {
        onEachEsNode(capturedArgument, source, function (esNode) {
            _this.emit('data', esNode);
        });
    });
    _this.emit('end');
};

function parseIfJson (source, propName) {
    if (typeof source[propName] === 'string') {
        source[propName] = JSON.parse(source[propName]);
    }
}

function onEachEsNode(capturedArgument, source, callback) {
    var espathToValue = reduce(capturedArgument.events, function (accum, ev) {
        accum[ev.espath] = ev.value;
        return accum;
    }, {});
    var nodeStack = [];
    estraverse.traverse(source.ast, {
        keys: source.visitorKeys,
        enter: function (currentNode, parentNode) {
            var parentEsNode = (0 < nodeStack.length) ? nodeStack[nodeStack.length - 1] : null;
            var esNode = createEsNode(this.path(), currentNode, espathToValue, source.content, source.tokens, parentEsNode);
            nodeStack.push(esNode);
            callback(esNode);
        },
        leave: function (currentNode, parentNode) {
            nodeStack.pop();
        }
    });
}

function isLiteral (node) {
    return literalPattern.test(node.type);
}

function createEsNode (path, currentNode, espathToValue, jsCode, tokens, parent) {
    var espath = path ? path.join('/') : '';
    return {
        espath: espath,
        parent: parent,
        key: path ? path[path.length - 1] : null,
        node: currentNode,
        code: jsCode.slice(currentNode.range[0], currentNode.range[1]),
        value: isLiteral(currentNode) ? currentNode.value : espathToValue[espath],
        isCaptured: espathToValue.hasOwnProperty(espath),
        range: locationOf(currentNode, tokens)
    };
}

module.exports = ContextTraversal;
