'use strict';

module.exports = function defaultOptions () {
    return {
        destructive: false,
        bindReceiver: true,
        onError: onError,
        onSuccess: onSuccess,
        patterns: [
            'assert(value, [message])',
            'assert.ok(value, [message])',
            'assert.equal(actual, expected, [message])',
            'assert.notEqual(actual, expected, [message])',
            'assert.strictEqual(actual, expected, [message])',
            'assert.notStrictEqual(actual, expected, [message])',
            'assert.deepEqual(actual, expected, [message])',
            'assert.notDeepEqual(actual, expected, [message])',
            'assert.deepStrictEqual(actual, expected, [message])',
            'assert.notDeepStrictEqual(actual, expected, [message])'
        ],
        wrapOnlyPatterns: []
    };
};

function onError (errorEvent) {
    var e = errorEvent.error;
    if (errorEvent.powerAssertContext && /^AssertionError/.test(e.name)) {
        e.powerAssertContext = errorEvent.powerAssertContext;
    }
    throw e;
}

function onSuccess(successEvent) {
    return successEvent.returnValue;
}
