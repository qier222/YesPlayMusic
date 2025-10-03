'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        "path.join(__dirname, 'vendor', 'exiftool')",
        "path.join(path.dirname(process.execPath), 'exiftool')",
      ],
    },
    deployFiles: [['vendor/exiftool', 'exiftool']],
  },
};
