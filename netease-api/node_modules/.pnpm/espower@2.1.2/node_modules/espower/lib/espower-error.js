'use strict';

function EspowerError (message, stackStartFunction) {
    if (Error.captureStackTrace) { // V8
        Error.captureStackTrace(this, stackStartFunction);
    } else {
        var _err = new Error();
        var _stack = _err.stack;
        if (!_stack) {  // IE10
            try {
                throw _err;
            } catch (e) {
                _stack = e.stack;
            }
        }
        this.stack = _stack;
    }
    this.message = '[espower] ' + message;
}
EspowerError.prototype = Object.create(Error.prototype);
EspowerError.prototype.constructor = EspowerError;
EspowerError.prototype.name = 'EspowerError';

module.exports = EspowerError;
