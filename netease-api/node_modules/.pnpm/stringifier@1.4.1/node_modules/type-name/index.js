/**
 * type-name - Just a reasonable typeof
 *
 * https://github.com/twada/type-name
 *
 * Copyright (c) 2014-2016 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/type-name/blob/master/LICENSE
 */
'use strict';

var toStr = Object.prototype.toString;

function funcName (f) {
    if (f.name) {
        return f.name;
    }
    var match = /^\s*function\s*([^\(]*)/im.exec(f.toString());
    return match ? match[1] : '';
}

function ctorName (obj) {
    var strName = toStr.call(obj).slice(8, -1);
    if ((strName === 'Object' || strName === 'Error') && obj.constructor) {
        return funcName(obj.constructor);
    }
    return strName;
}

function typeName (val) {
    var type;
    if (val === null) {
        return 'null';
    }
    type = typeof val;
    if (type === 'object') {
        return ctorName(val);
    }
    return type;
}

module.exports = typeName;
