'use strict';

var SourceMapConsumer = require('source-map').SourceMapConsumer;
var extend = require('xtend');

function isEmptyMapping (pos) {
    return ['source', 'line', 'column', 'name'].every(function (prop) {
        return pos[prop] === null;
    });
}

function PositionDetector (sourceMap) {
    if (sourceMap) {
        this.sourceMapConsumer = new SourceMapConsumer(sourceMap);
    }
}
PositionDetector.prototype.positionFor = function (currentNode) {
    var currentPosition = {
        source: currentNode.loc.source,
        line: currentNode.loc.start.line,
        column: currentNode.loc.start.column
    };
    if (this.sourceMapConsumer) {
        var found = this.sourceMapConsumer.originalPositionFor(currentPosition);
        if (found && !isEmptyMapping(found)) {
            return extend({ mapped: true }, found);
        }
    }
    return extend({ mapped: false }, currentPosition);
};

module.exports = PositionDetector;
