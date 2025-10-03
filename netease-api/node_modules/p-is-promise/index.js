'use strict';

const isObject = value => value !== null &&
	(typeof value === 'object' || typeof value === 'function');

module.exports = value => (
	value instanceof Promise ||
	(
		isObject(value) &&
		typeof value.then === 'function' &&
		typeof value.catch === 'function'
	)
);
