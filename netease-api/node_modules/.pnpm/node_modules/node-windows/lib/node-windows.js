/**
 * @class nodewindows
 * This is a standalone module, originally designed for internal use in [NGN](http://github.com/thinkfirst/NGN).
 * However; it is capable of providing the same features for Node.JS scripts
 * independently of NGN.
 *
 * ### Getting node-windows
 *
 * `npm install -g node-windows`
 *
 * ### Using node-windows
 *
 * `var nw = require('node-windows');`
 *
 * @singleton
 * @author Corey Butler
 */
if (require('os').platform().indexOf('win32') < 0) {
  throw 'node-windows is only supported on Windows.';
}

// Add binary invokers
module.exports = require('./binaries');

// Add command line shortcuts
var commands = require('./cmd');
for (var item in commands) {
  module.exports[item] = commands[item];
}

// Add daemon management capabilities
module.exports.Service = require('./daemon');
module.exports.EventLogger = require('./eventlog');