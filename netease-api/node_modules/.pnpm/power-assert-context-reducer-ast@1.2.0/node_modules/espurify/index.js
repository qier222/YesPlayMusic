/**
 * espurify - Clone new AST without extra properties
 *
 * https://github.com/estools/espurify
 *
 * Copyright (c) 2014-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/estools/espurify/blob/master/MIT-LICENSE.txt
 */
'use strict';

var createWhitelist = require('./lib/create-whitelist');
var cloneWithWhitelist = require('./lib/clone-ast');

function createCloneFunction (options) {
  return cloneWithWhitelist(createWhitelist(options));
}

var espurify = createCloneFunction();
espurify.customize = createCloneFunction;
espurify.cloneWithWhitelist = cloneWithWhitelist;
module.exports = espurify;
