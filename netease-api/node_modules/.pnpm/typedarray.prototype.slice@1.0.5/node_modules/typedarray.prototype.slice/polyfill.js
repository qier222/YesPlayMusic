'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return (typeof Uint8Array === 'function' && Uint8Array.prototype.slice) || implementation;
};
