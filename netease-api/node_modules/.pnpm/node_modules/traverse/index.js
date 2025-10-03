'use strict';

var whichTypedArray = require('which-typed-array');
var taSlice = require('typedarray.prototype.slice');
var gopd = require('gopd');

// TODO: use call-bind, is-date, is-regex, is-string, is-boolean-object, is-number-object
function toS(obj) { return Object.prototype.toString.call(obj); }
function isDate(obj) { return toS(obj) === '[object Date]'; }
function isRegExp(obj) { return toS(obj) === '[object RegExp]'; }
function isError(obj) { return toS(obj) === '[object Error]'; }
function isBoolean(obj) { return toS(obj) === '[object Boolean]'; }
function isNumber(obj) { return toS(obj) === '[object Number]'; }
function isString(obj) { return toS(obj) === '[object String]'; }

// TODO: use isarray
var isArray = Array.isArray || function isArray(xs) {
	return Object.prototype.toString.call(xs) === '[object Array]';
};

// TODO: use for-each?
function forEach(xs, fn) {
	if (xs.forEach) { return xs.forEach(fn); }
	for (var i = 0; i < xs.length; i++) {
		fn(xs[i], i, xs);
	}
	return void undefined;
}

// TODO: use object-keys
var objectKeys = Object.keys || function keys(obj) {
	var res = [];
	for (var key in obj) { res[res.length] = key; } // eslint-disable-line no-restricted-syntax
	return res;
};

var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var getOwnPropertySymbols = Object.getOwnPropertySymbols; // eslint-disable-line id-length

// TODO: use reflect.ownkeys and filter out non-enumerables
function ownEnumerableKeys(obj) {
	var res = objectKeys(obj);

	// Include enumerable symbol properties.
	if (getOwnPropertySymbols) {
		var symbols = getOwnPropertySymbols(obj);
		for (var i = 0; i < symbols.length; i++) {
			if (propertyIsEnumerable.call(obj, symbols[i])) {
				res[res.length] = symbols[i];
			}
		}
	}
	return res;
}

// TODO: use object.hasown
var hasOwnProperty = Object.prototype.hasOwnProperty || function (obj, key) {
	return key in obj;
};

function isWritable(object, key) {
	if (typeof gopd !== 'function') {
		return true;
	}

	var desc = gopd(object, key);
	return !desc || !desc.writable;
}

function copy(src, options) {
	if (typeof src === 'object' && src !== null) {
		var dst;

		if (isArray(src)) {
			dst = [];
		} else if (isDate(src)) {
			dst = new Date(src.getTime ? src.getTime() : src);
		} else if (isRegExp(src)) {
			dst = new RegExp(src);
		} else if (isError(src)) {
			dst = { message: src.message };
		} else if (isBoolean(src) || isNumber(src) || isString(src)) {
			dst = Object(src);
		} else {
			var ta = whichTypedArray(src);
			if (ta) {
				return taSlice(src);
			} else if (Object.create && Object.getPrototypeOf) {
				dst = Object.create(Object.getPrototypeOf(src));
			} else if (src.constructor === Object) {
				dst = {};
			} else {
				var proto = (src.constructor && src.constructor.prototype)
					|| src.__proto__
					|| {};
				var T = function T() {}; // eslint-disable-line func-style, func-name-matching
				T.prototype = proto;
				dst = new T();
			}
		}

		var iteratorFunction = options.includeSymbols ? ownEnumerableKeys : objectKeys;
		forEach(iteratorFunction(src), function (key) {
			dst[key] = src[key];
		});
		return dst;
	}
	return src;
}

/** @type {TraverseOptions} */
var emptyNull = { __proto__: null };

function walk(root, cb) {
	var path = [];
	var parents = [];
	var alive = true;
	var options = arguments.length > 2 ? arguments[2] : emptyNull;
	var iteratorFunction = options.includeSymbols ? ownEnumerableKeys : objectKeys;
	var immutable = !!options.immutable;

	return (function walker(node_) {
		var node = immutable ? copy(node_, options) : node_;
		var modifiers = { __proto__: null };

		var keepGoing = true;

		var state = {
			node: node,
			node_: node_,
			path: [].concat(path),
			parent: parents[parents.length - 1],
			parents: parents,
			key: path[path.length - 1],
			removedKeys: { __proto__: null },
			isRoot: path.length === 0,
			level: path.length,
			circular: null,
			update: function (x, stopHere) {
				if (!state.isRoot) {
					state.parent.node[state.key] = x;
				}
				state.node = x;
				if (stopHere) { keepGoing = false; }
			},
			delete: function (stopHere) {
				delete state.parent.node[state.key];
				state.parent.removedKeys[state.key] = true;
				if (stopHere) { keepGoing = false; }
			},
			remove: function (stopHere) {
				if (isArray(state.parent.node)) {
					state.parent.node.splice(state.key, 1);
					state.parent.removedKeys[state.key] = true;
					if (stopHere) { keepGoing = false; }
				} else {
					state.delete(stopHere);
				}
			},
			keys: null,
			before: function (f) { modifiers.before = f; },
			after: function (f) { modifiers.after = f; },
			pre: function (f) { modifiers.pre = f; },
			post: function (f) { modifiers.post = f; },
			stop: function () { alive = false; },
			block: function () { keepGoing = false; },
		};

		if (!alive) { return state; }

		function updateState() {
			if (typeof state.node === 'object' && state.node !== null) {
				if (!state.keys || state.node_ !== state.node) {
					state.keys = iteratorFunction(state.node);
				}

				state.isLeaf = state.keys.length === 0;

				for (var i = 0; i < parents.length; i++) {
					if (parents[i].node_ === node_) {
						state.circular = parents[i];
						break; // eslint-disable-line no-restricted-syntax
					}
				}
			} else {
				state.isLeaf = true;
				state.keys = null;
			}

			state.notLeaf = !state.isLeaf;
			state.notRoot = !state.isRoot;
		}

		updateState();

		// use return values to update if defined
		var ret = cb.call(state, state.node);
		if (ret !== undefined && state.update) { state.update(ret); }

		if (modifiers.before) { modifiers.before.call(state, state.node); }

		if (!keepGoing) { return state; }

		if (
			typeof state.node === 'object'
			&& state.node !== null
			&& !state.circular
		) {
			parents[parents.length] = state;

			updateState();

			forEach(state.keys, function (key, i) {
				var prevIsRemoved = (i - 1) in state.removedKeys;
				if (prevIsRemoved) {
					key = state.keys[i - 1]; // eslint-disable-line no-param-reassign
				}

				path[path.length] = (key);

				if (modifiers.pre) { modifiers.pre.call(state, state.node[key], key); }

				var child = walker(state.node[key]);
				if (
					immutable
					&& hasOwnProperty.call(state.node, key)
					&& !isWritable(state.node, key)
					&& !prevIsRemoved
				) {
					state.node[key] = child.node;
				}

				child.isLast = i === state.keys.length - 1;
				child.isFirst = i === 0;

				if (modifiers.post) { modifiers.post.call(state, child); }

				path.pop();
			});
			parents.pop();
		}

		if (modifiers.after) { modifiers.after.call(state, state.node); }

		return state;
	}(root)).node;
}

/** @typedef {{ immutable?: boolean, includeSymbols?: boolean }} TraverseOptions */

/**
 * A traverse constructor
 * @param {object} obj - the object to traverse
 * @param {TraverseOptions | undefined} [options] - options for the traverse
 * @constructor
 */
function Traverse(obj) {
	/** @type {TraverseOptions} */
	this.options = arguments.length > 1 ? arguments[1] : emptyNull;
	this.value = obj;
}

/** @type {(ps: PropertyKey[]) => Traverse['value']} */
Traverse.prototype.get = function (ps) {
	var node = this.value;
	for (var i = 0; node && i < ps.length; i++) {
		var key = ps[i];
		if (
			!hasOwnProperty.call(node, key)
			|| (!this.options.includeSymbols && typeof key === 'symbol')
		) {
			return void undefined;
		}
		node = node[key];
	}
	return node;
};

/** @type {(ps: PropertyKey[]) => boolean} */
Traverse.prototype.has = function (ps) {
	var node = this.value;
	// TODO: remove ps.length check
	if (!node && ps.length > 0) {
		return false;
	}
	for (var i = 0; node && i < ps.length; i++) {
		var key = ps[i];
		if (!hasOwnProperty.call(node, key) || (!this.options.includeSymbols && typeof key === 'symbol')) {
			return false;
		}
		node = node[key];
	}
	return true;
};

Traverse.prototype.set = function (ps, value) {
	var node = this.value;
	for (var i = 0; i < ps.length - 1; i++) {
		var key = ps[i];
		if (!hasOwnProperty.call(node, key)) { node[key] = {}; }
		node = node[key];
	}
	node[ps[i]] = value;
	return value;
};

Traverse.prototype.map = function (cb) {
	return walk(this.value, cb, { __proto__: null, immutable: true, includeSymbols: !!this.options.includeSymbols });
};

Traverse.prototype.forEach = function (cb) {
	this.value = walk(this.value, cb, this.options);
	return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
	var skip = arguments.length === 1;
	var acc = skip ? this.value : init;
	this.forEach(function (x) {
		if (!this.isRoot || !skip) {
			acc = cb.call(this, acc, x);
		}
	});
	return acc;
};

Traverse.prototype.paths = function () {
	var acc = [];
	this.forEach(function () {
		acc[acc.length] = this.path;
	});
	return acc;
};

Traverse.prototype.nodes = function () {
	var acc = [];
	this.forEach(function () {
		acc[acc.length] = this.node;
	});
	return acc;
};

Traverse.prototype.clone = function () {
	var parents = [];
	var nodes = [];
	var options = this.options;

	if (whichTypedArray(this.value)) {
		return taSlice(this.value);
	}

	return (function clone(src) {
		for (var i = 0; i < parents.length; i++) {
			if (parents[i] === src) {
				return nodes[i];
			}
		}

		if (typeof src === 'object' && src !== null) {
			var dst = copy(src, options);

			parents[parents.length] = (src);
			nodes[nodes.length] = (dst);

			var iteratorFunction = options.includeSymbols ? ownEnumerableKeys : objectKeys;
			forEach(iteratorFunction(src), function (key) {
				dst[key] = clone(src[key]);
			});

			parents.pop();
			nodes.pop();
			return dst;
		}

		return src;

	}(this.value));
};

/** @type {(obj: object, options?: TraverseOptions) => Traverse} */
function traverse(obj) {
	var options = arguments.length > 1 ? arguments[1] : emptyNull;
	return new Traverse(obj, options);
}

// TODO: replace with object.assign?
forEach(ownEnumerableKeys(Traverse.prototype), function (key) {
	traverse[key] = function (obj) {
		var args = [].slice.call(arguments, 1);
		var t = new Traverse(obj);
		return t[key].apply(t, args);
	};
});

module.exports = traverse;
