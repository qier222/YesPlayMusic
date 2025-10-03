/**
 * empower - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/power-assert-js/empower
 *
 * Copyright (c) 2013-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/power-assert-js/empower/blob/master/MIT-LICENSE.txt
 */
var empowerCore = require('empower-core');
var defaultOptions = require('./lib/default-options');
var capturable = require('./lib/capturable');
var assign = require('core-js/library/fn/object/assign');
var define = require('./lib/define-properties');

/**
 * Enhance Power Assert feature to assert function/object.
 * @param assert target assert function or object to enhance
 * @param formatter power assert format function
 * @param options enhancement options
 * @return enhanced assert function/object
 */
function empower (assert, formatter, options) {
    var config = assign(defaultOptions(), options);
    var eagerEvaluation = !(config.modifyMessageOnRethrow || config.saveContextOnRethrow);
    // see: https://github.com/power-assert-js/empower/pull/26
    var shouldRecreateAssertionError = (function isStackUnchanged () {
        if (typeof assert !== 'function') {
            return false;
        }
        if (typeof assert.AssertionError !== 'function') {
            return false;
        }
        var ae = new assert.AssertionError({
            actual: 123,
            expected: 456,
            operator: '==='
        });
        ae.message = '[REPLACED MESSAGE]';
        return !(/REPLACED MESSAGE/.test(ae.stack)) && /123 === 456/.test(ae.stack);
    })();

    var empowerCoreConfig = assign(config, {
        modifyMessageBeforeAssert: function (beforeAssertEvent) {
            var message = beforeAssertEvent.originalMessage;
            if (!eagerEvaluation) {
                return message;
            }
            return buildPowerAssertText(formatter, message, beforeAssertEvent.powerAssertContext);
        },
        onError: function onError (errorEvent) {
            var e = errorEvent.error;
            if (!/^AssertionError/.test(e.name)) {
                throw e;
            }
            if (!errorEvent.powerAssertContext) {
                throw e;
            }
            var poweredMessage;
            if (config.modifyMessageOnRethrow || config.saveContextOnRethrow) {
                poweredMessage = buildPowerAssertText(formatter, errorEvent.originalMessage, errorEvent.powerAssertContext);
                if (shouldRecreateAssertionError) {
                    e = new assert.AssertionError({
                        message: poweredMessage,
                        actual: e.actual,
                        expected: e.expected,
                        operator: e.operator,
                        stackStartFunction: e.stackStartFunction || onError
                    });
                    e.generatedMessage = false;
                }
            }
            if (config.modifyMessageOnRethrow && !shouldRecreateAssertionError) {
                e.message = poweredMessage;
                e.generatedMessage = false;
            }
            if (config.saveContextOnRethrow) {
                e.powerAssertContext = errorEvent.powerAssertContext;
            }
            throw e;
        }
    });
    var enhancedAssert = empowerCore(assert, empowerCoreConfig);
    define(enhancedAssert, capturable());
    return enhancedAssert;
}

function buildPowerAssertText (formatter, message, context) {
    // console.log(message);
    var powerAssertText = formatter(context);
    return message ? message + ' ' + powerAssertText : powerAssertText;
};

empower.defaultOptions = defaultOptions;
module.exports = empower;
