'use strict';

var _path = require('path');
var isAbsolute = require('path-is-absolute');
var isUrl = require('is-url');

function SourceAdjuster (sourceRoot, path, sourceMap) {
    this.path = path;
    this.sourceRoot = sourceRoot;
    if (typeof sourceMap === 'string') {
        this.sourceMap = JSON.parse(sourceMap.replace(/^\)\]\}'/, ''));
    } else {
        this.sourceMap = sourceMap;
    }
}
SourceAdjuster.prototype.relativize = function (filepathOrUrl, mappedWithSourceMap) {
    var filepath;
    if (mappedWithSourceMap && filepathOrUrl && this.sourceMap) {
        filepath = this.relativizeWithSourceMap(filepathOrUrl);
    } else {
        filepath = this.relativizeWithoutSourceMap(filepathOrUrl);
    }
    return fallbackOnBasename(filepath);
};
SourceAdjuster.prototype.relativizeWithSourceMap = function (filepathOrUrl) {
    var sourceMapRoot = this.sourceMap.sourceRoot;
    if (sourceMapRoot && isUrl(sourceMapRoot)) {
        return _path.relative(sourceMapRoot, filepathOrUrl);
    }
    if (this.sourceRoot && isAbsolute(this.sourceRoot) && isAbsolute(filepathOrUrl)) {
        return _path.relative(this.sourceRoot, filepathOrUrl);
    }
    if (sourceMapRoot && isAbsolute(sourceMapRoot) && isAbsolute(filepathOrUrl)) {
        return _path.relative(sourceMapRoot, filepathOrUrl);
    }
    if (isUrl(filepathOrUrl)) {
        return _path.basename(filepathOrUrl);
    }
    return filepathOrUrl;
};
SourceAdjuster.prototype.relativizeWithoutSourceMap = function (filepathOrUrl) {
    var tmpPath = this.path || filepathOrUrl;
    if (this.sourceRoot && isAbsolute(this.sourceRoot) && isAbsolute(tmpPath)) {
        return _path.relative(this.sourceRoot, tmpPath);
    } else {
        return this.path;
    }
};

function fallbackOnBasename (filepath) {
    if (filepath) {
        if (filepath.split(_path.sep).indexOf('..') !== -1) {
            return _path.basename(filepath);
        } else if (isUrl(filepath)) {
            return _path.basename(filepath);
        } else if (isAbsolute(filepath)) {
            return _path.basename(filepath);
        }
    }
    return filepath;
}

module.exports = SourceAdjuster;
