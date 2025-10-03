/**
 * espower-source - Power Assert instrumentor from source to source.
 *
 * https://github.com/power-assert-js/espower-source
 *
 * Copyright (c) 2014-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/power-assert-js/espower-source/blob/master/MIT-LICENSE.txt
 */
'use strict';

var espower = require('espower');
var acorn = require('acorn');
require('acorn-es7-plugin')(acorn);
var estraverse = require('estraverse');
var mergeVisitors = require('merge-estraverse-visitors');
var empowerAssert = require('empower-assert');
var escodegen = require('escodegen');
var extend = require('xtend');
var convert = require('convert-source-map');
var transfer = require('multi-stage-sourcemap').transfer;
var _path = require('path');
var isAbsolute = require('path-is-absolute');

function mergeSourceMap (incomingSourceMap, outgoingSourceMap) {
    if (typeof outgoingSourceMap === 'string' || outgoingSourceMap instanceof String) {
        outgoingSourceMap = JSON.parse(outgoingSourceMap);
    }
    if (!incomingSourceMap) {
        return outgoingSourceMap;
    }
    return JSON.parse(transfer({fromSourceMap: outgoingSourceMap, toSourceMap: incomingSourceMap}));
}

function copyPropertyIfExists (name, from, to) {
    if (from[name]) {
        to.setProperty(name, from[name]);
    }
}

function reconnectSourceMap (inMap, outMap) {
    var mergedRawMap = mergeSourceMap(inMap, outMap.toObject());
    var reMap = convert.fromObject(mergedRawMap);
    copyPropertyIfExists('sources', inMap, reMap);
    copyPropertyIfExists('sourceRoot', inMap, reMap);
    copyPropertyIfExists('sourcesContent', inMap, reMap);
    return reMap;
}

function handleIncomingSourceMap (originalCode, options) {
    var inMap;
    if (options.sourceMap) {
        if (typeof options.sourceMap === 'string' || options.sourceMap instanceof String) {
            options.sourceMap = JSON.parse(options.sourceMap);
        }
        inMap = options.sourceMap;
    } else {
        var sourceMappingURL = retrieveSourceMapURL(originalCode);
        var commented;
        // relative file sourceMap
        // //# sourceMappingURL=foo.js.map or /*# sourceMappingURL=foo.js.map */
        if (sourceMappingURL && !/^data:application\/json[^,]+base64,/.test(sourceMappingURL)) {
            commented = convert.fromMapFileSource(originalCode, _path.dirname(options.path));
        } else {
            // inline sourceMap or none sourceMap
            commented = convert.fromSource(originalCode);
        }

        if (commented) {
            inMap = commented.toObject();
            options.sourceMap = inMap;
        }
    }
    return inMap;
}

// copy from https://github.com/evanw/node-source-map-support/blob/master/source-map-support.js#L99
function retrieveSourceMapURL(source) {
    //        //# sourceMappingURL=foo.js.map                       /*# sourceMappingURL=foo.js.map */
    var re = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/)[ \t]*$)/mg;
    // Keep executing the search to find the *last* sourceMappingURL to avoid
    // picking up sourceMappingURLs from comments, strings, etc.
    var lastMatch, match;
    while (match = re.exec(source)) {
        lastMatch = match;
    }
    if (!lastMatch) {
        return null;
    }
    return lastMatch[1];
};


function adjustFilepath (filepath, sourceRoot) {
    if (!sourceRoot || !isAbsolute(filepath)) {
        return filepath;
    }
    return _path.relative(sourceRoot, filepath);
}

function syntaxErrorLine(lineNumber, maxLineNumberLength, line) {
    var content = ['    '];
    var lineNumberString = String(lineNumber);
    for (var i = lineNumberString.length; i < maxLineNumberLength; i++) {
        content.push(' ');
    }
    content.push(lineNumberString, ': ', line);
    return content.join('');
}

function showSyntaxErrorDetail(code, error, filepath) {
    var i;
    var begin = code.lastIndexOf('\n', error.pos);
    var end = code.indexOf('\n', error.pos);
    if (end === -1) {
        end = undefined;
    }
    var line = code.slice(begin + 1, end);
    var beforeLines = [];
    for (i = 0; i < 5; i++) {
        if (begin === -1) {
            break;
        }
        var lastBegin = begin;
        begin = code.lastIndexOf('\n', begin - 1);
        beforeLines.unshift(code.slice(begin + 1, lastBegin));
        if (begin === 0) {
            break;
        }
    }
    var afterLines = [];
    for (i = 0; i < 5; i++) {
        if (end === undefined) {
            break;
        }
        var lastEnd = end;
        end = code.indexOf('\n', end + 1);
        if (end === -1) {
            end = undefined;
        }
        afterLines.push(code.slice(lastEnd + 1, end));
    }

    var lines = [''];
    var numberLength = String(error.loc.line + afterLines.length).length;
    for (i = 0; i < beforeLines.length; i++) {
        lines.push(
            syntaxErrorLine(error.loc.line - beforeLines.length + i, numberLength, beforeLines[i])
        );
    }
    lines.push(syntaxErrorLine(error.loc.line, numberLength, line));
    var lineContent = [];
    for (i = 0; i < 6 + numberLength + error.loc.column - 1; i++) {
       lineContent.push(' ');
    }
    lineContent.push('^');
    lines.push(lineContent.join(''));
    for (i = 0; i < afterLines.length; i++) {
        lines.push(
            syntaxErrorLine(error.loc.line + i + 1, numberLength, afterLines[i])
        );
    }
    lines.push('', 'Parse Error: ' + error.message + (filepath ? ' in ' + filepath : ''));
    var detail = lines.join('\n');
    var err = new SyntaxError(detail);
    err.loc = error.loc;
    err.pos = error.pos;
    err.raisedAt = error.pos;
    throw err;
}

function instrument (originalCode, filepath, options) {
    var jsAst;
    try {
        jsAst = acorn.parse(originalCode, {locations: true, ecmaVersion: options.ecmaVersion, sourceType: options.sourceType, plugins: {asyncawait: true}});
    } catch (e) {
        if (e instanceof SyntaxError && e.pos && e.loc) {
            showSyntaxErrorDetail(originalCode, e, filepath);
        }
        throw e;
    }
    var modifiedAst = estraverse.replace(jsAst, mergeVisitors([
        {
            enter: empowerAssert.enter
        },
        espower.createVisitor(jsAst, options)
    ]));
    var escodegenOptions = extend({
        sourceMap: adjustFilepath(filepath || options.path, options.sourceRoot),
        sourceContent: originalCode,
        sourceMapWithCode: true
    });
    if (options.sourceRoot) {
        escodegenOptions.sourceMapRoot = options.sourceRoot;
    }
    return escodegen.generate(modifiedAst, escodegenOptions);
}

function instrumentWithoutSourceMapOutput (originalCode, options) {
    var jsAst;
    try {
        jsAst = acorn.parse(originalCode, {locations: true, ecmaVersion: options.ecmaVersion, sourceType: options.sourceType, plugins: {asyncawait: true}});
    } catch (e) {
        if (e instanceof SyntaxError && e.pos && e.loc) {
            showSyntaxErrorDetail(originalCode, e);
        }
        throw e;
    }
    var modifiedAst = estraverse.replace(jsAst, mergeVisitors([
        {
            enter: empowerAssert.enter
        },
        espower.createVisitor(jsAst, options)
    ]));
    return escodegen.generate(modifiedAst);
}

function mergeEspowerOptions (options, filepath) {
    return extend(espower.defaultOptions(), {
        ecmaVersion: 2018,
        sourceType: 'module',
        path: filepath
    }, options);
}

module.exports = function espowerSource (originalCode, filepath, options) {
    if (typeof originalCode === 'undefined' || originalCode === null) {
        throw new espower.EspowerError('`originalCode` is not specified', espowerSource);
    }
    var espowerOptions = mergeEspowerOptions(options, filepath);
    var inMap = handleIncomingSourceMap(originalCode, espowerOptions);
    if (!(filepath || espowerOptions.path)) {
        return instrumentWithoutSourceMapOutput(originalCode, espowerOptions);
    }
    var instrumented = instrument(originalCode, filepath, espowerOptions);
    var outMap = convert.fromJSON(instrumented.map.toString());
    if (inMap) {
        var reMap = reconnectSourceMap(inMap, outMap);
        return instrumented.code + '\n' + reMap.toComment() + '\n';
    } else {
        return instrumented.code + '\n' + outMap.toComment() + '\n';
    }
};
