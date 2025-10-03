'use strict';

module.exports = {
  pkg: {
    patches: {
      'build/scripts.js': [
        "path.join(__dirname, '..', 'scripts')",
        "path.join(path.dirname(process.execPath), 'drivelist')",
      ],
      'lib/scripts.js': [
        "path.join(__dirname, '..', 'scripts')",
        "path.join(path.dirname(process.execPath), 'drivelist')", // for 4.0.0
      ],
    },
    deployFiles: [
      ['build/Release/drivelist.node', 'drivelist.node'],
      ['scripts/darwin.sh', 'drivelist/darwin.sh'],
      ['scripts/linux.sh', 'drivelist/linux.sh'],
      ['scripts/win32.bat', 'drivelist/win32.bat'],
    ],
  },
};
