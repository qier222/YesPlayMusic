'use strict';

var $TypeError = require('es-errors/type');

var Get = require('es-abstract/2024/Get');
var GetValueFromBuffer = require('es-abstract/2024/GetValueFromBuffer');
var IsDetachedBuffer = require('es-abstract/2024/IsDetachedBuffer');
var max = require('math-intrinsics/max');
var min = require('math-intrinsics/min');
var Set = require('es-abstract/2024/Set');
var SetValueInBuffer = require('es-abstract/2024/SetValueInBuffer');
var ToIntegerOrInfinity = require('es-abstract/2024/ToIntegerOrInfinity');
var ToString = require('es-abstract/2024/ToString');
var TypedArrayElementSize = require('es-abstract/2024/TypedArrayElementSize');
var TypedArrayElementType = require('es-abstract/2024/TypedArrayElementType');
var TypedArraySpeciesCreate = require('es-abstract/2024/TypedArraySpeciesCreate');
var ValidateTypedArray = require('es-abstract/2024/ValidateTypedArray');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');

// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice

module.exports = function slice(start, end) {
	var O = this; // step 1

	ValidateTypedArray(O, 'SEQ-CST'); // step 2

	// 3. Let len be O.[[ArrayLength]].
	var len = O.length; // steps 3

	var relativeStart = ToIntegerOrInfinity(start); // step 4

	var k;
	if (relativeStart === -Infinity) {
		k = 0; // step 5
	} else if (relativeStart < 0) {
		k = max(len + relativeStart, 0); // step 6
	} else {
		k = min(relativeStart, len); // step 7
	}

	var relativeEnd = typeof end === 'undefined' ? len : ToIntegerOrInfinity(end); // step 8

	var final;
	if (relativeEnd === -Infinity) {
		final = 0; // step 9
	} else if (relativeEnd < 0) {
		final = max(len + relativeEnd, 0); // step 10
	} else {
		final = min(relativeEnd, len); // step 11
	}

	var count = max(final - k, 0); // step 12

	var A = TypedArraySpeciesCreate(O, [count]); // step 13

	if (count > 0) { // step 14
		if (IsDetachedBuffer(typedArrayBuffer(O))) {
			throw new $TypeError('Cannot use a Typed Array with an underlying ArrayBuffer that is detached'); // step 14.a
		}
		var srcType = TypedArrayElementType(O); // step 14.b
		var targetType = TypedArrayElementType(A); // step 14.c
		if (srcType === targetType) { // step 14.d
			//  1. NOTE: The transfer must be performed in a manner that preserves the bit-level encoding of the source data.
			var srcBuffer = typedArrayBuffer(O); // step 14.d.ii
			var targetBuffer = typedArrayBuffer(A); // step 14.d.iii
			var elementSize = TypedArrayElementSize(O); // step 14.d.iv
			var srcByteOffset = typedArrayByteOffset(O); // step 14.d.v
			var srcByteIndex = (k * elementSize) + srcByteOffset; // step 14.d.vi
			var targetByteIndex = typedArrayByteOffset(A); // step 14.d.vii
			var limit = targetByteIndex + (count * elementSize); // step 14.d.viii
			while (targetByteIndex < limit) { // step 14.d.ix
				var value = GetValueFromBuffer(srcBuffer, srcByteIndex, 'UINT8', true, 'UNORDERED'); // step 14.d.ix.1
				SetValueInBuffer(targetBuffer, targetByteIndex, 'UINT8', value, true, 'UNORDERED'); // step 14.d.ix.2
				srcByteIndex += 1; // step 14.d.ix.3
				targetByteIndex += 1; // step 14.d.ix.4
			}
		} else { // step 14.e
			var n = 0; // step 14.e.i
			while (k < final) { // step 14.e.ii
				var Pk = ToString(k); // step 14.e.ii.1
				var kValue = Get(O, Pk); // step 14.e.ii.2
				Set(A, ToString(n), kValue, true); // step 14.e.ii.3
				k += 1; // step 14.e.ii.4
				n += 1; // step 14.e.ii.5
			}
		}
	}

	return A; // step 15
};
