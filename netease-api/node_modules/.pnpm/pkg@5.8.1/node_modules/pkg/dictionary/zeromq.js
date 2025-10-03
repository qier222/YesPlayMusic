'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/native.js': [
        'path.join(__dirname, "..")',
        'path.dirname(process.execPath)',
      ],
    },
    deployFiles: [['prebuilds', 'prebuilds', 'directory']],
  },
};
