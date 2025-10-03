'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        'path.join(__dirname, fs',
        "path.join(path.dirname(process.execPath), 'electron', fs",
      ],
    },
    deployFiles: [
      ['dist', 'electron/dist', 'directory'],
      ['../sliced/index.js', 'node_modules/sliced/index.js'],
      ['../deep-defaults/lib/index.js', 'node_modules/deep-defaults/index.js'],
    ],
  },
};
