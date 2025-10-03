'use strict';

var test = require('tape');
var traverse = require('../');

test('sort test', function (t) {
	var acc = [];
	traverse({
		a: 30,
		b: 22,
		id: 9,
	}).forEach(function (node) {
		if (!Array.isArray(node) && typeof node === 'object') {
			this.before(function (beforeNode) {
				this.keys = Object.keys(beforeNode);
				this.keys.sort(function (a, b) {
					var aA = [a === 'id' ? 0 : 1, a];
					var bA = [b === 'id' ? 0 : 1, b];
					return aA < bA ? -1 : aA > bA ? 1 : 0;
				});
			});
		}
		if (this.isLeaf) { acc.push(node); }
	});

	t.equal(
		acc.join(' '),
		'9 30 22',
		'Traversal in a custom order'
	);

	t.end();
});
