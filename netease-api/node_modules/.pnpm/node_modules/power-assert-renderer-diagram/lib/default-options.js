'use strict';

module.exports = function defaultOptions () {
    return {
        ambiguousEastAsianCharWidth: 2,
        maxDepth: 2,
        indent: null,
        outputOffset: 2,
        anonymous: 'Object',
        circular: '#@Circular#',
        lineSeparator: '\n'
    };
};
