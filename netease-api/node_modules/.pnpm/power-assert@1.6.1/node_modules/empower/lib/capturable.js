'use strict';

module.exports = function capturable () {
    var events = [];

    function _capt (value, espath) {
        events.push({value: value, espath: espath});
        return value;
    }

    function _expr (value, args) {
        var captured = events;
        events = [];
        var source = {
            content: args.content,
            filepath: args.filepath,
            line: args.line
        };
        if (args.generator) {
            source.generator = true;
        }
        if (args.async) {
            source.async = true;
        }
        return {
            powerAssertContext: {
                value: value,
                events: captured
            },
            source: source
        };
    }

    return {
        _capt: _capt,
        _expr: _expr
    };
};
