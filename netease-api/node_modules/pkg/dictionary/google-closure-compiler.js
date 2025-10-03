'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/node/closure-compiler.js': [
        "require.resolve('../../compiler.jar')",
        "require('path').join(require('path').dirname(process.execPath), 'compiler/compiler.jar')",
      ],
    },
    deployFiles: [['compiler.jar', 'compiler/compiler.jar']],
  },
};
