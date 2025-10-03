'use strict';

module.exports = {
  pkg: {
    assets: [
      // TODO look at exceljs and implement as
      // many __dirname use cases as possible
      'lib/**/*.xml',
    ],
    patches: {
      'lib/stream/xlsx/workbook-writer.js': [
        "require.resolve('../../xlsx/xml/theme1.xml')",
        "require('path').join(__dirname, '../../xlsx/xml/theme1.xml')",
      ],
      'lib/xlsx/xlsx.js': [
        "require.resolve('./xml/theme1.xml')",
        "require('path').join(__dirname, './xml/theme1.xml')",
      ],
    },
  },
};
