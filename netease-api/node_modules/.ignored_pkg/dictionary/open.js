'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        "path.join(__dirname, 'xdg-open')",
        "path.join(path.dirname(process.execPath), 'xdg-open')",
      ],
    },
    deployFiles: [['xdg-open', 'xdg-open']],
  },
};
