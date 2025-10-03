'use strict';

var define = require('define-properties');
var getProto = require('get-proto');

var getPolyfill = require('./polyfill');

module.exports = function shimTypedArraySlice() {
	if (typeof Uint8Array === 'function') {
		var polyfill = getPolyfill();
		var proto = getProto(Uint8Array.prototype);
		define(
			proto,
			{ slice: polyfill },
			{ slice: function () { return proto.slice !== polyfill; } }
		);
	}

	return polyfill;
};
