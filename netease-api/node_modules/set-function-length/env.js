'use strict';

var gOPD = require('gopd');

var functionsHaveConfigurableLengths = gOPD && gOPD(function () {}, 'length').configurable;

var functionsHaveWritableLengths = gOPD && gOPD(function () {}, 'length').writable;

var boundFnsHaveConfigurableLengths = gOPD && gOPD(function () {}.bind(), 'length').configurable;

var boundFnsHaveWritableLengths = gOPD && gOPD(function () {}.bind(), 'length').writable;

module.exports = {
	__proto__: null,
	boundFnsHaveConfigurableLengths: boundFnsHaveConfigurableLengths,
	boundFnsHaveWritableLengths: boundFnsHaveWritableLengths,
	functionsHaveConfigurableLengths: functionsHaveConfigurableLengths,
	functionsHaveWritableLengths: functionsHaveWritableLengths
};
