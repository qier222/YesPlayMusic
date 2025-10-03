'use strict';

var test = require('tape');
var assert = require('assert');
var traverse = require('../');
var deepEqual = require('./lib/deep_equal');

test('mutate', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).forEach(function (x) {
		if (typeof x === 'number' && x % 2 === 0) {
			this.update(x * 10);
		}
	});
	t.same(obj, res);
	t.same(obj, { a: 1, b: 20, c: [3, 40] });
	t.end();
});

test('mutateT', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse.forEach(obj, function (x) {
		if (typeof x === 'number' && x % 2 === 0) {
			this.update(x * 10);
		}
	});
	t.same(obj, res);
	t.same(obj, { a: 1, b: 20, c: [3, 40] });
	t.end();
});

test('map', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).map(function (x) {
		if (typeof x === 'number' && x % 2 === 0) {
			this.update(x * 10);
		}
	});
	t.same(obj, { a: 1, b: 2, c: [3, 4] });
	t.same(res, { a: 1, b: 20, c: [3, 40] });
	t.end();
});

test('mapT', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse.map(obj, function (x) {
		if (typeof x === 'number' && x % 2 === 0) {
			this.update(x * 10);
		}
	});
	t.same(obj, { a: 1, b: 2, c: [3, 4] });
	t.same(res, { a: 1, b: 20, c: [3, 40] });
	t.end();
});

test('clone', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).clone();
	t.same(obj, res);
	t.ok(obj !== res);
	obj.a += 1;
	t.same(res.a, 1);
	obj.c.push(5);
	t.same(res.c, [3, 4]);
	t.end();
});

test('cloneT', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse.clone(obj);
	t.same(obj, res);
	t.ok(obj !== res);
	obj.a += 1;
	t.same(res.a, 1);
	obj.c.push(5);
	t.same(res.c, [3, 4]);
	t.end();
});

test('cloneTypedArray', { skip: typeof Uint8Array !== 'function' }, function (t) {
	var obj = new Uint8Array([1]);
	var res = traverse.clone(obj);

	t.same(obj, res);
	t.ok(obj !== res);
	obj.set([2], 0);
	res.set([3], 0);
	t.same(obj, new Uint8Array([2]));
	t.same(res, new Uint8Array([3]));
	t.end();
});

test('reduce', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).reduce(function (acc, x) {
		if (this.isLeaf) { acc.push(x); }
		return acc;
	}, []);
	t.same(obj, { a: 1, b: 2, c: [3, 4] });
	t.same(res, [1, 2, 3, 4]);
	t.end();
});

test('reduceInit', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).reduce(function (acc) {
		if (this.isRoot) { assert.fail('got root'); }
		return acc;
	});
	t.same(obj, { a: 1, b: 2, c: [3, 4] });
	t.same(res, obj);
	t.end();
});

test('remove', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	traverse(obj).forEach(function (x) {
		if (this.isLeaf && x % 2 === 0) { this.remove(); }
	});

	t.same(obj, { a: 1, c: [3] });
	t.end();
});

test('removeNoStop', function (t) {
	var obj = { a: 1, b: 2, c: { d: 3, e: 4 }, f: 5 };

	var keys = [];
	traverse(obj).forEach(function () {
		keys.push(this.key);
		if (this.key === 'c') { this.remove(); }
	});

	t.same(keys, [undefined, 'a', 'b', 'c', 'd', 'e', 'f']);
	t.end();
});

test('removeStop', function (t) {
	var obj = { a: 1, b: 2, c: { d: 3, e: 4 }, f: 5 };

	var keys = [];
	traverse(obj).forEach(function () {
		keys.push(this.key);
		if (this.key === 'c') { this.remove(true); }
	});

	t.same(keys, [undefined, 'a', 'b', 'c', 'f']);
	t.end();
});

test('removeMap', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).map(function (x) {
		if (this.isLeaf && x % 2 === 0) { this.remove(); }
	});

	t.same(obj, { a: 1, b: 2, c: [3, 4] });
	t.same(res, { a: 1, c: [3] });
	t.end();
});

test('delete', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	traverse(obj).forEach(function (x) {
		if (this.isLeaf && x % 2 === 0) { this.delete(); }
	});

	t.ok(!deepEqual(obj, { a: 1, c: [3, undefined] }));

	t.ok(deepEqual(obj, { a: 1, c: [3] }));

	t.ok(!deepEqual(obj, { a: 1, c: [3, null] }));
	t.end();
});

test('deleteNoStop', function (t) {
	var obj = { a: 1, b: 2, c: { d: 3, e: 4 } };

	var keys = [];
	traverse(obj).forEach(function () {
		keys.push(this.key);
		if (this.key === 'c') { this.delete(); }
	});

	t.same(keys, [undefined, 'a', 'b', 'c', 'd', 'e']);
	t.end();
});

test('deleteStop', function (t) {
	var obj = { a: 1, b: 2, c: { d: 3, e: 4 } };

	var keys = [];
	traverse(obj).forEach(function () {
		keys.push(this.key);
		if (this.key === 'c') { this.delete(true); }
	});

	t.same(keys, [undefined, 'a', 'b', 'c']);
	t.end();
});

test('deleteRedux', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4, 5] };
	traverse(obj).forEach(function (x) {
		if (this.isLeaf && x % 2 === 0) { this.delete(); }
	});

	t.ok(!deepEqual(obj, { a: 1, c: [3, undefined, 5] }));

	// eslint-disable-next-line no-sparse-arrays
	t.ok(deepEqual(obj, { a: 1, c: [3,, 5] }));

	t.ok(!deepEqual(obj, { a: 1, c: [3, null, 5] }));

	t.ok(!deepEqual(obj, { a: 1, c: [3, 5] }));

	t.end();
});

test('deleteMap', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).map(function (x) {
		if (this.isLeaf && x % 2 === 0) { this.delete(); }
	});

	t.ok(deepEqual(
		obj,
		{ a: 1, b: 2, c: [3, 4] }
	));

	var xs = [3, 4];
	delete xs[1];

	t.ok(deepEqual(res, { a: 1, c: xs }));

	// eslint-disable-next-line comma-spacing, no-sparse-arrays
	t.ok(deepEqual(res, { a: 1, c: [3,,] }));

	t.ok(deepEqual(res, { a: 1, c: [3] }));

	t.end();
});

test('deleteMapRedux', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4, 5] };
	var res = traverse(obj).map(function (x) {
		if (this.isLeaf && x % 2 === 0) { this.delete(); }
	});

	t.ok(deepEqual(
		obj,
		{ a: 1, b: 2, c: [3, 4, 5] }
	));

	var xs = [3, 4, 5];
	delete xs[1];

	t.ok(deepEqual(res, { a: 1, c: xs }));

	t.ok(!deepEqual(res, { a: 1, c: [3, 5] }));

	// eslint-disable-next-line no-sparse-arrays
	t.ok(deepEqual(res, { a: 1, c: [3,, 5] }));

	t.end();
});

test('objectToString', function (t) {
	var obj = { a: 1, b: 2, c: [3, 4] };
	var res = traverse(obj).forEach(function (x) {
		if (typeof x === 'object' && !this.isRoot) {
			this.update(JSON.stringify(x));
		}
	});
	t.same(obj, res);
	t.same(obj, { a: 1, b: 2, c: '[3,4]' });
	t.end();
});

test('stringToObject', function (t) {
	var obj = { a: 1, b: 2, c: '[3,4]' };
	var res = traverse(obj).forEach(function (x) {
		if (typeof x === 'string') {
			this.update(JSON.parse(x));
		} else if (typeof x === 'number' && x % 2 === 0) {
			this.update(x * 10);
		}
	});
	t.deepEqual(obj, res);
	t.deepEqual(obj, { a: 1, b: 20, c: [3, 40] });
	t.end();
});

test('array item removal', function (t) {
	var obj = [
		function a() {},
		function b() {},
		'a',
	];

	function cb(x) {
		if (x !== obj) {
			// console.log("**", x, typeof x)
			if (typeof x === 'function') { this.remove(); }
		}
	}

	var result = traverse(obj, { immutable: true }).forEach(cb);

	t.equal(obj.length, 3, 'immutable: makes no changes');

	t.deepEqual(result, ['a'], 'immutable result: removes all functions');

	traverse(obj).forEach(cb);

	t.deepEqual(obj, ['a'], 'removes all functions');

	t.end();
});
