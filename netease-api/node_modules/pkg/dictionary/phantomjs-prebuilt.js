'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/phantomjs.js': [
        '__dirname, location.location',
        "path.dirname(process.execPath), 'phantom', path.basename(location.location)",
      ],
    },
    deployFiles: [
      ['lib/phantom/bin/phantomjs', 'phantom/phantomjs'],
      ['lib/phantom/bin/phantomjs.exe', 'phantom/phantomjs.exe'],
    ],
  },
};
