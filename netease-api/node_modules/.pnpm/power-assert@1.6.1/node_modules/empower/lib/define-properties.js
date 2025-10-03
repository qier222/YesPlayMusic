'use strict';

var defineProperty = require('core-js/library/fn/object/define-property');
var forEach = require('core-js/library/fn/array/for-each');
var keys = require('core-js/library/fn/object/keys');

module.exports = function defineProperties (obj, map) {
    forEach(keys(map), function (name) {
        defineProperty(obj, name, {
            configurable: true,
            enumerable: false,
            value: map[name],
            writable: true
        });
    });
};
