'use strict';

var test = require('tape');
var traverse = require('../');
var deepEqual = require('./lib/deep_equal');
var util = require('util');

test('circular', function (t) {
	t.plan(1);

	var obj = { x: 3 };
	obj.y = obj;
	traverse(obj).forEach(function () {
		if (this.path.join('') === 'y') {
			t.equal(
				util.inspect(this.circular.node),
				util.inspect(obj)
			);
		}
	});
});

test('deepCirc', function (t) {
	t.plan(2);
	var obj = { x: [1, 2, 3], y: [4, 5] };
	obj.y[2] = obj;

	traverse(obj).forEach(function () {
		if (this.circular) {
			t.deepEqual(this.circular.path, []);
			t.deepEqual(this.path, ['y', '2']);
		}
	});
});

test('doubleCirc', function (t) {
	var obj = { x: [1, 2, 3], y: [4, 5] };
	obj.y[2] = obj;
	obj.x.push(obj.y);

	var circs = [];
	traverse(obj).forEach(function (x) {
		if (this.circular) {
			circs.push({ circ: this.circular, self: this, node: x });
		}
	});

	t.deepEqual(circs[0].self.path, ['x', '3', '2']);
	t.deepEqual(circs[0].circ.path, []);

	t.deepEqual(circs[1].self.path, ['y', '2']);
	t.deepEqual(circs[1].circ.path, []);

	t.deepEqual(circs.length, 2);
	t.end();
});

test('circDubForEach', function (t) {
	var obj = { x: [1, 2, 3], y: [4, 5] };
	obj.y[2] = obj;
	obj.x.push(obj.y);

	traverse(obj).forEach(function () {
		if (this.circular) { this.update('...'); }
	});

	t.same(obj, { x: [1, 2, 3, [4, 5, '...']], y: [4, 5, '...'] });
	t.end();
});

test('circDubMap', function (t) {
	var obj = { x: [1, 2, 3], y: [4, 5] };
	obj.y[2] = obj;
	obj.x.push(obj.y);

	var c = traverse(obj).map(function () {
		if (this.circular) {
			this.update('...');
		}
	});

	t.same(c, { x: [1, 2, 3, [4, 5, '...']], y: [4, 5, '...'] });
	t.end();
});

test('circClone', function (t) {
	var obj = { x: [1, 2, 3], y: [4, 5] };
	obj.y[2] = obj;
	obj.x.push(obj.y);

	var clone = traverse.clone(obj);
	t.ok(obj !== clone);

	t.ok(clone.y[2] === clone);
	t.ok(clone.y[2] !== obj);
	t.ok(clone.x[3][2] === clone);
	t.ok(clone.x[3][2] !== obj);
	t.same(clone.x.slice(0, 3), [1, 2, 3]);
	t.same(clone.y.slice(0, 2), [4, 5]);
	t.end();
});

test('circMapScrub', function (t) {
	var obj = { a: 1, b: 2 };
	obj.c = obj;

	var scrubbed = traverse(obj).map(function () {
		if (this.circular) { this.remove(); }
	});
	t.same(
		Object.keys(scrubbed).sort(),
		['a', 'b']
	);
	t.ok(deepEqual(scrubbed, { a: 1, b: 2 }));

	t.equal(obj.c, obj);
	t.end();
});
