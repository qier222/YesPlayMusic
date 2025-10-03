/**
 * espower-loader - Power Assert feature instrumentor on the fly.
 *
 * https://github.com/power-assert-js/espower-loader
 *
 * Copyright (c) 2013-2017 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/power-assert-js/espower-loader/blob/master/MIT-LICENSE.txt
 */
var extensions = require.extensions;
var originalLoader = extensions['.js'];
var fs = require('fs');
var extend = require('xtend');
var minimatch = require('minimatch');
var convert = require('convert-source-map');
var sourceMapSupport = require('source-map-support');
var espowerSourceToSource = require('espower-source');
var pathToMap = {};

function espowerLoader (options) {
    'use strict';
    options = extend({ cwd: process.cwd() }, options);

    var patternStartsWithSlash = (options.pattern.lastIndexOf('/', 0) === 0);
    var separator = patternStartsWithSlash ? '' : '/';
    var pattern = options.cwd + separator + options.pattern;
    sourceMapSupport.install({
        retrieveSourceMap: function (source) {
            if (minimatch(source, pattern) && pathToMap[source]) {
                return {
                    map: pathToMap[source]
                };
            }
            return null;
        }
    });
    var espowerOptions = extend({ sourceRoot: options.cwd }, options.espowerOptions);

    extensions['.js'] = function (localModule, filepath) {
        var output;
        if (minimatch(filepath, pattern)){
            output = espowerSourceToSource(fs.readFileSync(filepath, 'utf-8'), filepath, espowerOptions);
            var map = convert.fromSource(output).toObject();
            pathToMap[filepath] = map;
            localModule._compile(output, filepath);
        } else {
            originalLoader(localModule, filepath);
        }
    };
}

module.exports = espowerLoader;
