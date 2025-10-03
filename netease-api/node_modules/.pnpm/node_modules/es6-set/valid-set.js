"use strict";

var isSet = require("./is-set");

module.exports = function (value) {
	if (!isSet(value)) throw new TypeError(value + " is not a Set");
	return value;
};
