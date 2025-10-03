/**
 * stringifier
 * 
 * https://github.com/twada/stringifier
 *
 * Copyright (c) 2014-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://twada.mit-license.org/2014-2018
 */
'use strict';

var traverse = require('traverse');
var typeName = require('type-name');
var assign = require('core-js/library/fn/object/assign');
var endsWith = require('core-js/library/fn/string/ends-with');
var s = require('./strategies');

function defaultHandlers () {
    return {
        'null': s.always('null'),
        'undefined': s.always('undefined'),
        'function': s.prune(),
        'string': s.json(),
        'boolean': s.json(),
        'number': s.number(),
        'symbol': s.toStr(),
        'RegExp': s.toStr(),
        'String': s.newLike(),
        'Boolean': s.newLike(),
        'Number': s.newLike(),
        'Date': s.newLike(),
        'Array': s.array(),
        'Object': s.object(),
        'Error': s.object(null, ['message', 'code']),
        '@default': s.object()
    };
}

function defaultOptions () {
    return {
        maxDepth: null,
        indent: null,
        anonymous: '@Anonymous',
        circular: '#@Circular#',
        snip: '..(snip)',
        lineSeparator: '\n',
        typeFun: typeName
    };
}

function createStringifier (customOptions) {
    var options = assign({}, defaultOptions(), customOptions);
    var handlers = assign({}, defaultHandlers(), options.handlers);
    return function stringifyAny (push, x) {
        var context = this;
        var handler = handlerFor(context.node, options, handlers);
        var currentPath = '/' + context.path.join('/');
        var customization = handlers[currentPath];
        var acc = {
            context: context,
            options: options,
            handlers: handlers,
            push: push
        };
        if (typeName(customization) === 'function') {
            handler = customization;
        } else if (typeName(customization) === 'number') {
            handler = s.flow.compose(s.filters.truncate(customization),handler);
        } else if (context.parent && typeName(context.parent.node) === 'Array' && !(context.key in context.parent.node)) {
            // sparse arrays
            handler = s.always('');
        }
        handler(acc, x);
        return push;
    };
}

function handlerFor (val, options, handlers) {
    var tname = options.typeFun(val);
    if (typeName(handlers[tname]) === 'function') {
        return handlers[tname];
    }
    if (endsWith(tname, 'Error')) {
        return handlers['Error'];
    }
    return handlers['@default'];
}

function walk (val, reducer) {
    var buffer = [];
    var push = function (str) {
        buffer.push(str);
    };
    traverse(val).reduce(reducer, push);
    return buffer.join('');
}

function stringify (val, options) {
    return walk(val, createStringifier(options));
}

function stringifier (options) {
    return function (val) {
        return walk(val, createStringifier(options));
    };
}

stringifier.stringify = stringify;
stringifier.strategies = s;
stringifier.defaultOptions = defaultOptions;
stringifier.defaultHandlers = defaultHandlers;
module.exports = stringifier;
