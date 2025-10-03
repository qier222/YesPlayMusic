'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/error.js': [
        'return err;',
        'if (err.message.indexOf("SyntaxError") >= 0) {' +
          'err.message = "Pkg: Try to specify your ' +
          "javascript file in 'assets' in config. \" + err.message;" +
          '};\n' +
          'return err;',
        'if (Error.captureStackTrace) {',
        'if (this.message.indexOf("SyntaxError") >= 0) {' +
          'this.message = "Pkg: Try to specify your ' +
          "javascript file in 'assets' in config. \" + this.message;" +
          '};\n' +
          'if (Error.captureStackTrace) {',
      ],
    },
  },
};
