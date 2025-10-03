"use strict";

var objToString       = Object.prototype.toString
  , toStringTagSymbol = require("es6-symbol").toStringTag
  , id                = "[object Set]"
  , Global            = typeof Set === "undefined" ? null : Set;

module.exports = function (value) {
	return (
		(value &&
			((Global && (value instanceof Global || value === Global.prototype)) ||
				objToString.call(value) === id ||
				value[toStringTagSymbol] === "Set")) ||
		false
	);
};
