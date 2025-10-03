'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/bunyan.js': ["mv = require('mv' + '');", "mv = require('mv');"],
    },
  },
};
