'use strict';

var index = require('../');
var test = require('tape');
var runTests = require('./tests');

test('as a function', function (t) {
	t.test('bad array/this value', function (st) {
		st['throws'](function () { index(undefined); }, TypeError, 'undefined is not an object');
		st['throws'](function () { index(null); }, TypeError, 'null is not an object');

		st.end();
	});

	t.test('Typed Array support', { skip: typeof Uint8Array === 'undefined' }, function (st) {
		runTests(index, st);

		st.end();
	});

	t.end();
});
