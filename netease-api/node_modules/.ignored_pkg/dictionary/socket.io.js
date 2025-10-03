'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/index.js': [
        "require.resolve('socket.io-client/dist/socket.io.js.map')",
        "require.resolve('socket.io-client/dist/socket.io.js.map', 'must-exclude')",
      ],
    },
  },
};
