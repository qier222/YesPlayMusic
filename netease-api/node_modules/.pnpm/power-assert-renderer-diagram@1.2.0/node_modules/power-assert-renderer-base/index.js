'use strict';

function BaseRenderer () {
}

BaseRenderer.prototype.init = function (traversal) {
    var _this = this;
    traversal.on('start', function (context) {
        _this.onStart(context);
    });
    traversal.on('data', function (esNode) {
        _this.onData(esNode);
    });
    traversal.on('end', function () {
        _this.onEnd();
    });
};

BaseRenderer.prototype.setWritable = function (writable) {
    this.writable = writable;
};

// API
BaseRenderer.prototype.onStart = function (context) {
};

// API
BaseRenderer.prototype.onData = function (esNode) {
};

// API
BaseRenderer.prototype.onEnd = function () {
};

// API
BaseRenderer.prototype.write = function (str) {
    this.writable.write(str);
};

module.exports = BaseRenderer;
