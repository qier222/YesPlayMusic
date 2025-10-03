'use strict';

module.exports = {
  pkg: {
    patches: {
      'j.js': [
        "require('xl'+'sx')",
        "require('xlsx')",
        "require('xl'+'sjs')",
        "require('xlsjs')",
        "require('ha'+'rb')",
        "require('harb')",
      ],
    },
  },
};
