'use strict';

module.exports = {
  pkg: {
    patches: {
      'dist/worker-pool.js': [
        'error.stack = message.error.stack;',
        'error.stack = message.error.stack;\n' +
          'if (error.stack.indexOf("SyntaxError") >= 0) {' +
          'error.stack = "Pkg: Try to specify your ' +
          "javascript file in 'assets' in config.\\n\" + error.stack;" +
          '};',
      ],
    },
  },
};
