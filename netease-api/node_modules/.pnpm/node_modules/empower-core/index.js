/**
 * empower-core - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/power-assert-runtime/packages/empower-core
 *
 * Copyright (c) 2013-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/power-assert-runtime/blob/master/LICENSE
 */
var create = require('core-js/library/fn/object/create');
var assign = require('core-js/library/fn/object/assign');
var defaultOptions = require('./lib/default-options');
var Decorator = require('./lib/decorator');
var define = require('./lib/define-properties');
var slice = Array.prototype.slice;

/**
 * Enhance Power Assert feature to assert function/object.
 * @param assert target assert function or object to enhance
 * @param options enhancement options
 * @return enhanced assert function/object
 */
function empowerCore (assert, options) {
    var typeOfAssert = (typeof assert);
    var enhancedAssert;
    if ((typeOfAssert !== 'object' && typeOfAssert !== 'function') || assert === null) {
        throw new TypeError('empower-core argument should be a function or object.');
    }
    if (isEmpowered(assert)) {
        return assert;
    }
    switch (typeOfAssert) {
    case 'function':
        enhancedAssert = empowerAssertFunction(assert, options);
        break;
    case 'object':
        enhancedAssert = empowerAssertObject(assert, options);
        break;
    default:
        throw new Error('Cannot be here');
    }
    define(enhancedAssert, { _empowered: true });
    return enhancedAssert;
}

function empowerAssertObject (assertObject, options) {
    var config = assign(defaultOptions(), options);
    var target = config.destructive ? assertObject : create(assertObject);
    var decorator = new Decorator(target, config);
    return assign(target, decorator.enhancement());
}

function empowerAssertFunction (assertFunction, options) {
    var config = assign(defaultOptions(), options);
    if (config.destructive) {
        throw new Error('cannot use destructive:true to function.');
    }
    var decorator = new Decorator(assertFunction, config);
    var enhancement = decorator.enhancement();
    var powerAssert;
    if (typeof enhancement === 'function') {
        powerAssert = function powerAssert () {
            return enhancement.apply(null, slice.apply(arguments));
        };
    } else {
        powerAssert = function powerAssert () {
            return assertFunction.apply(null, slice.apply(arguments));
        };
    }
    assign(powerAssert, assertFunction);
    return assign(powerAssert, enhancement);
}

function isEmpowered (assertObjectOrFunction) {
    return assertObjectOrFunction._empowered;
}

empowerCore.defaultOptions = defaultOptions;
module.exports = empowerCore;
