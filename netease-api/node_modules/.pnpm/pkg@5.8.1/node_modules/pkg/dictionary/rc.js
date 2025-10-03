'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/utils.js': [
        'process.cwd()',
        "require('path').dirname(require.main.filename)",
      ],
    },
  },
};
