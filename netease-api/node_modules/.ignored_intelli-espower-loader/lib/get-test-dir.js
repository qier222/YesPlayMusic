// LICENSE : MIT
"use strict";
var normalizeDir = require("./normalize-dir");
var defaultTestDir = "test/";
/**
 * Return `dir/` string
 * always suffix with `/`
 * @param {object} pkg
 * @returns {string}
 */
function getTestDirFromPkg(pkg) {
    if (pkg &&
        typeof pkg.directories === 'object' &&
        typeof pkg.directories.test === 'string') {
        return normalizeDir(pkg.directories.test);
    }
    return defaultTestDir;
}

module.exports = getTestDirFromPkg;