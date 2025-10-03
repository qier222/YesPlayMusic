'use strict';

module.exports = {
  pkg: {
    patches: {
      'graceful-fs.js': [
        { do: 'prepend' },
        'if ((function() {\n' +
          "  var version = require('./package.json').version;\n" +
          "  var major = parseInt(version.split('.')[0]);\n" +
          '  if (major < 4) {\n' +
          "    module.exports = require('fs');\n" +
          '    return true;\n' +
          '  }\n' +
          '})()) return;\n',
      ],
    },
  },
};
