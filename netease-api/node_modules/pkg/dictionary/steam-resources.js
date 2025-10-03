'use strict';

module.exports = {
  pkg: {
    assets: ['steam_language/**/*'],
    patches: {
      'steam_language_parser/index.js': [
        'process.chdir',
        '// process.chdir',
        "'steammsg.steamd'",
        "require('path').join(__dirname, '../steam_language', 'steammsg.steamd')",
      ],
      'steam_language_parser/parser/token_analyzer.js': [
        'text.value',
        "require('path').join(__dirname, '../../steam_language', text.value)",
      ],
    },
  },
};
