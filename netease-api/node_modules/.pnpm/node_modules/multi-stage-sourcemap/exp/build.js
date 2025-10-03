"use strict";
var coffee = require("coffee-script");
var fs = require("fs");
var transfer = require("../lib/multi-stage-sourcemap");
var convert = require('convert-source-map');
var sourceMap = require("source-map");
var esprima = require("esprima"),
    escodegen = require("escodegen"),
    esmangle = require("esmangle");
// coffee -> js -> min.jsb
var filepath = "./origin.coffee";
var code = fs.readFileSync(filepath, "utf-8");
var result_coffee = coffee.compile(code, {
    sourceMap: true
});
var ast = esprima.parse(result_coffee.js, {
    loc: true,
    source: filepath
});
// Get optimized AST
var optimized = esmangle.optimize(ast, null);
// gets mangled AST
var result_esmangle = esmangle.mangle(optimized);
var result_escodegen = escodegen.generate(result_esmangle, {
    sourceMap: true, // Settings source in esprima's options gives us
    sourceMapWithCode: true // Get both code and source map
});

fs.writeFileSync("one_pass_result.js", result_escodegen.code + "\n" + convert.fromObject(result_escodegen.map).toComment(), "utf-8");
// multi level source map
var re_map = JSON.parse(result_coffee.v3SourceMap);
re_map.file = filepath;
var newSource = transfer({
    fromSourceMap: result_escodegen.map.toString(),
    toSourceMap: JSON.stringify(re_map)
});
var comment = convert.fromObject(JSON.parse(newSource)).toComment();
fs.writeFileSync("two_pass_result.js", result_escodegen.code + "\n" + comment, "utf-8");

/*

var coffee = require('coffee-script'),
    originalCompileFile = coffee._compileFile,
    minimatch = require('minimatch'),
    espowerSource = require('espower-source');
var sourceMap = require("source-map");
var Generator = sourceMap.SourceMapGenerator;
var Consumer = sourceMap.SourceMapConsumer;

var transfer = require("multi-stage-sourcemap").transfer;
var convert = require('convert-source-map');
function espowerCoffee(options) {
    'use strict';

    var separator = (options.pattern.lastIndexOf('/', 0) === 0) ? '' : '/',
        pattern = options.cwd + separator + options.pattern;

    coffee._compileFile = function (filepath, sourceMap) {
        var answer = originalCompileFile(filepath, sourceMap);
        if (minimatch(filepath, pattern)) {
            if (sourceMap) {
                answer.js = espowerSource(answer.js, filepath, options.espowerOptions);
                var endSource = convert.fromSource(answer.js);
                var map = JSON.parse(answer.v3SourceMap);
                map.file = filepath;
                var newSource = transfer({
                    fromSourceMap: JSON.stringify(endSource.sourcemap),
                    toSourceMap: JSON.stringify(map)
                });
                var comment = convert.fromObject(JSON.parse(newSource)).toComment();
                answer.js = convert.removeComments(answer.js) + comment + "\n";
            } else {
                answer = espowerSource(answer, filepath, options.espowerOptions);
            }
        }
        return answer;
    };

    coffee.register();
}

module.exports = espowerCoffee;

 */