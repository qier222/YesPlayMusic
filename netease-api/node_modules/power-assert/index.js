/**
 * power-assert.js - Power Assert in JavaScript.
 *
 * https://github.com/power-assert-js/power-assert
 *
 * Copyright (c) 2013-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/power-assert-js/power-assert/blob/master/MIT-LICENSE.txt
 */
'use strict';

var baseAssert = require('assert');
var _deepEqual = require('universal-deep-strict-equal');
var empower = require('empower');
var formatter = require('power-assert-formatter');
var assign = require('xtend/mutable');
var define = require('define-properties');
var empowerOptions = {
    modifyMessageOnRethrow: true,
    saveContextOnRethrow: true
};

if (typeof baseAssert.deepStrictEqual !== 'function') {
    baseAssert.deepStrictEqual = function deepStrictEqual (actual, expected, message) {
        if (!_deepEqual(actual, expected, true)) {
            baseAssert.fail(actual, expected, message, 'deepStrictEqual');
        }
    };
}
if (typeof baseAssert.notDeepStrictEqual !== 'function') {
    baseAssert.notDeepStrictEqual = function notDeepStrictEqual (actual, expected, message) {
        if (_deepEqual(actual, expected, true)) {
            baseAssert.fail(actual, expected, message, 'notDeepStrictEqual');
        }
    };
}

function customize (customOptions) {
    var options = customOptions || {};
    var applyEmpower = function (fn) {
        return empower(
            fn,
            formatter(options.output),
            assign({}, empowerOptions, options.assertion)
        );
    };
    var poweredAssert = applyEmpower(baseAssert);
    poweredAssert.customize = customize;
    if (typeof baseAssert.strict === 'function') {
        poweredAssert.strict = applyEmpower(baseAssert.strict);
    } else {
        var strict = applyEmpower(baseAssert);
        poweredAssert.strict = assign(strict, {
            equal: strict.strictEqual,
            deepEqual: strict.deepStrictEqual,
            notEqual: strict.notStrictEqual,
            notDeepEqual: strict.notDeepStrictEqual
        });
    }
    poweredAssert.strict.strict = poweredAssert.strict;
    return poweredAssert;
}

var defaultAssert = customize();
define(defaultAssert, { '__esModule': true });
defaultAssert['default'] = defaultAssert;
module.exports = defaultAssert;
