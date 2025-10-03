'use strict';

var isArray = require('core-js/library/fn/array/is-array');
var objectKeys = require('core-js/library/fn/object/keys');
var indexOf = require('core-js/library/fn/array/index-of');
var Map = require('core-js/library/fn/map');
var reduce = require('core-js/library/fn/array/reduce');

module.exports = function cloneWithWhitelist (astWhiteList) {
  var whitelist = reduce(objectKeys(astWhiteList), function (props, key) {
    var propNames = astWhiteList[key];
    var prepend = (indexOf(propNames, 'type') === -1) ? ['type'] : [];
    props[key] = prepend.concat(propNames || []);
    return props;
  }, {});

  function cloneNodeOrObject (obj, seen) {
    var props = obj.type ? whitelist[obj.type] : null;
    if (props) {
      return cloneNode(obj, props, seen);
    } else {
      return cloneObject(obj, seen);
    }
  }

  function cloneArray (ary, seen) {
    var i = ary.length;
    var clone = [];
    while (i--) {
      clone[i] = cloneOf(ary[i], seen);
    }
    return clone;
  }

  function cloneNode (node, props, seen) {
    var i, len, key;
    var clone = {};
    for (i = 0, len = props.length; i < len; i += 1) {
      key = props[i];
      if (node.hasOwnProperty(key)) {
        clone[key] = cloneOf(node[key], seen);
      }
    }
    return clone;
  }

  function cloneObject (obj, seen) {
    var props = objectKeys(obj);
    var i, len, key, value;
    var clone = {};
    for (i = 0, len = props.length; i < len; i += 1) {
      key = props[i];
      value = obj[key];
      if (seen.has(value)) {
        continue;
      }
      clone[key] = cloneOf(value, seen);
    }
    return clone;
  }

  function cloneOf (val, seen) {
    if (typeof val === 'object' && val !== null) {
      seen.set(val, true);
      if (val instanceof RegExp) {
        return new RegExp(val);
      } else if (isArray(val)) {
        return cloneArray(val, seen);
      } else {
        return cloneNodeOrObject(val, seen);
      }
    } else {
      return val;
    }
  }

  function cloneRoot (obj) {
    var seen = new Map();
    seen.set(obj, true);
    return cloneNodeOrObject(obj, seen);
  }

  return cloneRoot;
};
