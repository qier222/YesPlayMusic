'use strict';

var ContextTraversal = require('power-assert-context-traversal');
var inherits = require('util').inherits;
var slice = Array.prototype.slice;

function LegacyContextTraversal (powerAssertContext) {
    ContextTraversal.call(this, powerAssertContext);
}
inherits(LegacyContextTraversal, ContextTraversal);

LegacyContextTraversal.prototype.setWritable = function (writer) {
    this.writer = writer;
};

LegacyContextTraversal.prototype.on = function () {
    var args = slice.apply(arguments);
    if (args[0] === 'render') {
        args[0] = 'end';
    }
    ContextTraversal.prototype.on.apply(this, args);
};

LegacyContextTraversal.prototype.emit = function () {
    var args = slice.apply(arguments);
    if (args[0] === 'end') {
        args[1] = this.writer;
    }
    ContextTraversal.prototype.emit.apply(this, args);
};

module.exports = LegacyContextTraversal;
