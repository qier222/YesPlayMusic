'use strict';

module.exports = {
  pkg: {
    assets: ['lib/**/*.styl'],
    log: function (log, opts) {
      log.warn(
        'Add { paths: [ __dirname ] } to ' +
          'stylus options to resolve imports',
        [opts.packagePath]
      );
    },
  },
};
