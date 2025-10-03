/**
 * espower - Power Assert feature instrumentor based on the ECMAScript AST.
 *
 * https://github.com/power-assert-js/espower
 *
 * Copyright (c) 2013-2019 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/power-assert-js/espower/blob/master/MIT-LICENSE.txt
 */
'use strict';

var defaultOptions = require('./lib/default-options');
var Instrumentor = require('./lib/instrumentor');

/**
 * Instrument power assert feature into code. ECMAScript AST in, ECMAScript AST out.
 *
 * @param {object} ast ECMAScript AST to be instrumented (directly modified)
 * @param {object} options Instrumentation options.
 * @returns {object} instrumented AST
 * @throws {EspowerError} if `ast` is already instrumented
 * @throws {EspowerError} if `ast` does not contain location information
 * @throws {EspowerError} if `options` is not valid
 */
function espower (ast, options) {
    var instrumentor = new Instrumentor(Object.assign(defaultOptions(), options));
    return instrumentor.instrument(ast);
}

/**
 * Generate visitor object to be used with `estraverse.replace`
 *
 * @param {object} ast ECMAScript AST to be instrumented (directly modified)
 * @param {object} options Instrumentation options.
 * @returns {object} visitor object for estraverse
 * @throws {EspowerError} if `ast` is already instrumented
 * @throws {EspowerError} if `ast` does not contain location information
 * @throws {EspowerError} if `options` is not valid
 */
espower.createVisitor = function createVisitor (ast, options) {
    var instrumentor = new Instrumentor(Object.assign(defaultOptions(), options));
    return instrumentor.createVisitor(ast);
};

espower.defaultOptions = defaultOptions;
espower.EspowerError = require('./lib/espower-error');
module.exports = espower;
