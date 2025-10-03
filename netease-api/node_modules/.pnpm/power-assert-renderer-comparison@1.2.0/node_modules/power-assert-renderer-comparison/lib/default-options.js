'use strict';

module.exports = function defaultOptions () {
    return {
        lineDiffThreshold: 5,
        maxDepth: 2,
        indent: null,
        outputOffset: 2,
        anonymous: 'Object',
        circular: '#@Circular#',
        lineSeparator: '\n'
    };
};
