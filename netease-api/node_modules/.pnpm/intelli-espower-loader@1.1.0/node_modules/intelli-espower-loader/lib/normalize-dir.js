"use strict";
var pather = require("path");
function isEndedWithSeparator(filePath) {
    return filePath[filePath.length - 1] === pather.sep;
}
function normalizeDirPath(filePath) {
    if (isEndedWithSeparator(filePath)) {
        return filePath;
    } else {
        return filePath + pather.sep;
    }
}
module.exports = normalizeDirPath;