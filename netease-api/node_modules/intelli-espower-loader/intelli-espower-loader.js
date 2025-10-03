"use strict";
var pather = require("path");
var pkg = require("./lib/get-package-json")(module.paths);
var testDirectory = require("./lib/get-test-dir")(pkg);
require('espower-loader')({
    cwd: process.cwd(),
    pattern: testDirectory + "**" + pather.sep + "*.js"
});
