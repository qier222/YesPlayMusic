/**
 * espower-location-detector:
 *   AST source location detection helper for power-assert
 * 
 * https://github.com/twada/espower-location-detector
 *
 * Copyright (c) 2015-2016 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/espower-location-detector/blob/master/LICENSE
 */
'use strict';

var PositionDetector = require('./lib/position-detector');
var SourceAdjuster = require('./lib/source-adjuster');

function EspowerLocationDetector (options) {
    this.positionDetector = new PositionDetector(options.sourceMap);
    this.sourceAdjuster = new SourceAdjuster(options.sourceRoot, options.path, options.sourceMap);
}

EspowerLocationDetector.prototype.locationFor = function (currentNode) {
    var pos = this.positionDetector.positionFor(currentNode);
    return {
        source: this.sourceAdjuster.relativize(pos.source, pos.mapped),
        line: pos.line,
        column: pos.column
    };
};

module.exports = EspowerLocationDetector;
