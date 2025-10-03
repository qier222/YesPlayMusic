'use strict';

var BaseRenderer = require('power-assert-renderer-base');
var stringWidth = require('power-assert-util-string-width');
var inherits = require('util').inherits;

function AssertionRenderer () {
    BaseRenderer.call(this);
}
inherits(AssertionRenderer, BaseRenderer);

AssertionRenderer.prototype.onStart = function (context) {
    this.context = context;
    this.assertionLine = context.source.content;
};

AssertionRenderer.prototype.onEnd = function () {
    this.write('');
    this.write(this.assertionLine);
    var e = this.context.source.error;
    if (e && e instanceof SyntaxError) {
        var re = /Unexpected token \(1\:(\d+)\)/;
        var matchResult = re.exec(e.message);
        if (matchResult) {
            var syntaxErrorIndex = Number(matchResult[1]);
            this.renderValueAt(syntaxErrorIndex, '?');
            this.renderValueAt(syntaxErrorIndex, '?');
            this.renderValueAt(syntaxErrorIndex, e.toString());
            this.renderValueAt(0, '');
            this.renderValueAt(0, 'If you are using `babel-plugin-espower` and want to use experimental syntax in your assert(), you should set `embedAst` option to true.');
            this.renderValueAt(0, 'see: https://github.com/power-assert-js/babel-plugin-espower#optionsembedast');
        }
    }
};

AssertionRenderer.prototype.renderValueAt = function (idx, str) {
    var row = createRow(stringWidth(this.assertionLine), ' ');
    replaceColumn(idx, row, str);
    this.write(row.join(''));
};

function replaceColumn (columnIndex, row, str) {
    var i, width = stringWidth(str);
    for (i = 0; i < width; i += 1) {
        row.splice(columnIndex + i, 1, str.charAt(i));
    }
}

function createRow (numCols, initial) {
    var row = [], i;
    for(i = 0; i < numCols; i += 1) {
        row[i] = initial;
    }
    return row;
}

module.exports = AssertionRenderer;
