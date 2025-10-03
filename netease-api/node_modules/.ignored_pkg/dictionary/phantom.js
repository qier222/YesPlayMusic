'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/phantom.js': [
        "__dirname + '/shim/index.js'",
        "_path2.default.join(_path2.default.dirname(process.execPath), 'phantom/index.js')",
      ],
    },
    deployFiles: [
      ['lib/shim/index.js', 'phantom/index.js'],
      [
        'lib/shim/function_bind_polyfill.js',
        'phantom/function_bind_polyfill.js',
      ],
    ],
  },
};
