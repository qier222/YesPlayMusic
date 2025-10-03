'use strict';

var empowerCore = require('empower-core');
var assign = require('core-js/library/fn/object/assign');

module.exports = function defaultOptions () {
    return assign(empowerCore.defaultOptions(), {
        modifyMessageOnRethrow: false,
        saveContextOnRethrow: false
    });
};
