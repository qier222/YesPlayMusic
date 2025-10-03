'use strict';

module.exports = {
  pkg: {
    files: [
      // suppress because hundreds of
      // C++ files go inside executable
    ],
    assets: ['etc/*.pem', 'deps/grpc/etc/*.pem'],
  },
};
