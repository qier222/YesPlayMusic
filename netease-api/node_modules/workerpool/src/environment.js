
// source: https://github.com/flexdinesh/browser-or-node
// source: https://github.com/mozilla/pdf.js/blob/7ea0e40e588864cd938d1836ec61f1928d3877d3/src/shared/util.js#L24
var isNode = function (nodeProcess) {
  return (
    typeof nodeProcess !== 'undefined' &&
    nodeProcess.versions != null &&
    nodeProcess.versions.node != null &&
    nodeProcess + '' === '[object process]'
  );
}
module.exports.isNode = isNode

// determines the JavaScript platform: browser or node
module.exports.platform = typeof process !== 'undefined' && isNode(process)
  ? 'node'
  : 'browser';

// determines whether the code is running in main thread or not
// note that in node.js we have to check both worker_thread and child_process
var worker_threads = module.exports.platform === 'node' && require('worker_threads');
module.exports.isMainThread = module.exports.platform === 'node'
  ? ((!worker_threads || worker_threads.isMainThread) && !process.connected)
  : typeof Window !== 'undefined';

// determines the number of cpus available
module.exports.cpus = module.exports.platform === 'browser'
  ? self.navigator.hardwareConcurrency
  : require('os').cpus().length;

