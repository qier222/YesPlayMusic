"use strict";
var assert = require("power-assert");
var sourceMap = require("source-map");
var Generator = sourceMap.SourceMapGenerator;
var Consumer = sourceMap.SourceMapConsumer;
var transfer = require("../lib/multi-stage-sourcemap");
describe("multi-stage-sourcemap", function () {
    var middleSource;
    var lastSource;
    beforeEach(function () {
        // origin -> middle
        middleSource = (function () {
            var gen = new Generator({
                file: 'middle.js',
                sourceRoot: '/path/to/root'
            });
            gen.addMapping({
                source: 'original.js',
                original: { line: 1, column: 0 },
                generated: { line: 2, column: 2 },
                name: 'foo'
            });
            return gen.toString();
        })();
        // middle -> last
        lastSource = (function () {
            var gen = new Generator({
                file: 'last.js',
                sourceRoot: '/path/to/root'
            });
            gen.addMapping({
                source: 'middle.js',
                original: { line: 2, column: 2 },
                generated: { line: 4, column: 4 },
                name: 'bar'
            });
            return gen.toString();
        })();

    });
    it("should convert js", function () {
        // map result to origin
        var resultMap = transfer({fromSourceMap: lastSource, toSourceMap: middleSource});
        var resultSMC = new Consumer(resultMap);
        var originalPosition = resultSMC.originalPositionFor({
            line: 4,
            column: 4
        });
        assert(originalPosition.source === '/path/to/root/original.js');
        assert(originalPosition.line === 1);
        assert(originalPosition.column === 0);
    });
});