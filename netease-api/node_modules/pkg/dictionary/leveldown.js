'use strict';

module.exports = {
  pkg: {
    patches: {
      'binding.js': ['__dirname', "require('path').dirname(process.execPath)"],
    },
    deployFiles: [['prebuilds', 'prebuilds', 'directory']],
  },
};
