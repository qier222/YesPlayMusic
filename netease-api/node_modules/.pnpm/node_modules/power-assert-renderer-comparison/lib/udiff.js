'use strict';

var DiffMatchPatch = require('diff-match-patch');
var dmp = new DiffMatchPatch();

function udiff (config) {
    return function diff (text1, text2) {
        var patch;
        if (config && shouldUseLineLevelDiff(text1, config)) {
            patch = udiffLines(text1, text2);
        } else {
            patch = udiffChars(text1, text2);
        }
        return decodeURIComponent(patch);
    };
}

function shouldUseLineLevelDiff (text, config) {
    return config.lineDiffThreshold < text.split(/\r\n|\r|\n/).length;
}

function udiffLines(text1, text2) {
    /*jshint camelcase: false */
    var a = dmp.diff_linesToChars_(text1, text2);
    var diffs = dmp.diff_main(a.chars1, a.chars2, false);
    dmp.diff_charsToLines_(diffs, a.lineArray);
    dmp.diff_cleanupSemantic(diffs);
    return dmp.patch_toText(dmp.patch_make(text1, diffs));
}

function udiffChars (text1, text2) {
    /*jshint camelcase: false */
    var diffs = dmp.diff_main(text1, text2, false);
    dmp.diff_cleanupSemantic(diffs);
    return dmp.patch_toText(dmp.patch_make(text1, diffs));
}

module.exports = udiff;
