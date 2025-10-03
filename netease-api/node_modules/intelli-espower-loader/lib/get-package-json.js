// LICENSE : MIT
"use strict";

var assert = require("assert");
var path = require("path");
var packageName = require("../package.json").name;
var packageNameReg = new RegExp('^' + packageName); // for support nodejs < 4.x, same as 'startsWith'

function findPackageDir(paths) {
    if (!paths) {
        return null;
    }
    for (var i = 0; i < paths.length; ++i) {
        var dir = path.dirname(paths[i]);
        var dirName = dir.split(path.sep).pop();

        // ignore self and `.pnpm`. (support pnpm install)
        if (!packageNameReg.test(dirName) && dirName !== '.pnpm') {
          return dir;
        }
    }
}
/**
 * find package.json directory and return package json.
 * You should pass `module.paths` to `paths`.
 * @param {string[]} paths the paths for look-up
 * @returns {object}
 */
function getPackageJSON(paths) {
    var dir = findPackageDir(paths);
    assert(dir, "package.json is not found");
    return require(path.resolve(dir, "package.json"));
}
module.exports = getPackageJSON;
