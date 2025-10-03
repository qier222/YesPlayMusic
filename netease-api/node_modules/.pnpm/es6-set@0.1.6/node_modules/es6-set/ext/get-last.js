"use strict";

module.exports = function () {
	var value, iterator = this.values(), item = iterator.next();
	while (!item.done) {
		value = item.value;
		item = iterator.next();
	}
	return value;
};
