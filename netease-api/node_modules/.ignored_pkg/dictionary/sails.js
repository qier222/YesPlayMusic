'use strict';

module.exports = {
  pkg: {
    scripts: ['lib/**/*.js'],
    patches: {
      'lib/hooks/moduleloader/index.js': [
        "require('coffee-script/register')",
        '',
      ],
      'lib/app/configuration/index.js': [
        'hook = require(hookBundled);',
        'hook = require(hookBundled);' +
          // force to take the whole package
          "require('sails-hook-sockets');",
      ],
      'lib/hooks/grunt/index.js': [
        'var child = ChildProcess.fork(',
        '\n' +
          "sails.log.warn('*******************************************************************');\n" +
          "sails.log.warn('** Pkg: Grunt hook is temporarily disabled in pkg-ed app         **');\n" +
          "sails.log.warn('** Instead it should be run before compilation to prepare files  **');\n" +
          "sails.log.warn('*******************************************************************');\n" +
          "sails.emit('hook:grunt:done');\n" +
          'return cb_afterTaskStarted();(',
      ],
      'lib/hooks/orm/backwards-compatibility/upgrade-datastore.js': [
        'if (!fs.existsSync(modulePath)) {',
        'try { require(modulePath); } catch (e) {',
      ],
    },
  },
};
