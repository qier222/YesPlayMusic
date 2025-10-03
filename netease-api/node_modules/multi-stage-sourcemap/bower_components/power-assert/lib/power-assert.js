/**
 * power-assert.js - Power Assert in JavaScript.
 *
 * https://github.com/twada/power-assert
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/power-assert/master/MIT-LICENSE.txt
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(['assert', 'empower', 'power-assert-formatter'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('assert'), require('empower'), require('power-assert-formatter'));
    } else {
        root.assert = factory(root.assert, root.empower, root.powerAssertFormatter);
    }
}(this, function (baseAssert, empower, formatter) {
    'use strict';

    return empower(baseAssert, formatter(), {modifyMessageOnFail: true, saveContextOnFail: true});
}));
