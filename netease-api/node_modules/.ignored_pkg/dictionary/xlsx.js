'use strict';

module.exports = {
  pkg: {
    patches: {
      'xlsx.js': [
        "require('js'+'zip')",
        "require('jszip')",
        "require('./js'+'zip')",
        "require('./jszip')",
        "require('./od' + 's')",
        "require('./ods')",
      ],
    },
  },
};
