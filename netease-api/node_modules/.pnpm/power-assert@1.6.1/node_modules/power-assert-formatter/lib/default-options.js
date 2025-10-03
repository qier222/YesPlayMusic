'use strict';

module.exports = function defaultOptions () {
    return {
        lineDiffThreshold: 5,
        maxDepth: 1,
        outputOffset: 2,
        anonymous: 'Object',
        circular: '#@Circular#',
        lineSeparator: '\n',
        ambiguousEastAsianCharWidth: 2,
        renderers: [
            './built-in/file',
            './built-in/assertion',
            './built-in/diagram',
            './built-in/binary-expression'
        ]
    };
};
