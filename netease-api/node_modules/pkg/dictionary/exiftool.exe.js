'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        "path.join(__dirname, 'vendor', 'exiftool.exe')",
        "path.join(path.dirname(process.execPath), 'exiftool.exe')",
      ],
    },
    deployFiles: [['vendor/exiftool.exe', 'exiftool.exe']],
  },
};
