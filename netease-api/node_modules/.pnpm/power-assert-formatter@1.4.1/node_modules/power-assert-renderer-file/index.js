'use strict';

var BaseRenderer = require('power-assert-renderer-base');
var inherits = require('util').inherits;

function FileRenderer () {
    BaseRenderer.call(this);
}
inherits(FileRenderer, BaseRenderer);

FileRenderer.prototype.onStart = function (context) {
    this.filepath = context.source.filepath;
    this.lineNumber = context.source.line;
};

FileRenderer.prototype.onEnd = function () {
    if (this.filepath) {
        this.write('# ' + [this.filepath, this.lineNumber].join(':'));
    } else {
        this.write('# at line: ' + this.lineNumber);
    }
};

module.exports = FileRenderer;
