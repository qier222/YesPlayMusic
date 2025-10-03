'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        "require.resolve('./compiler.jar')",
        "require('path').join(require('path').dirname(process.execPath), 'compiler/compiler.jar')",
      ],
    },
    deployFiles: [['compiler.jar', 'compiler/compiler.jar']],
  },
};
