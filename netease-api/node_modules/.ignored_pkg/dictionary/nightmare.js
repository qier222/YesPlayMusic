'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/nightmare.js': [
        "path.join(__dirname, 'runner.js')",
        "path.join(path.dirname(process.execPath), 'nightmare/runner.js')",
      ],
    },
    deployFiles: [
      ['lib/runner.js', 'nightmare/runner.js'],
      ['lib/frame-manager.js', 'nightmare/frame-manager.js'],
      ['lib/ipc.js', 'nightmare/ipc.js'],
      ['lib/preload.js', 'nightmare/preload.js'],
    ],
  },
};
