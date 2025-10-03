'use strict';

var test = require('tape');
var traverse = require('../');

test('traverse an Uint8Array', { skip: typeof Uint8Array !== 'function' }, function (t) {
	var obj = new Uint8Array(4);
	var results = traverse(obj).map(function () {});
	t.same(results, obj);
	t.end();
});

