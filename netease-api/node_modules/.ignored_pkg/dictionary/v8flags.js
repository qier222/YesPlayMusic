'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        "execFile(process.execPath, ['--v8-options'],",
        "execFile(process.execPath, ['--v8-options'], " +
          "{ env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' } },",
      ],
    },
  },
};
