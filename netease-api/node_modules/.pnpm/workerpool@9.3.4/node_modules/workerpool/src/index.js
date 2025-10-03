const {platform, isMainThread, cpus} = require('./environment');

/** @typedef {import("./Pool")} Pool */
/** @typedef {import("./types.js").WorkerPoolOptions} WorkerPoolOptions */
/** @typedef {import("./types.js").WorkerRegisterOptions} WorkerRegisterOptions */

/**
 * @template { { [k: string]: (...args: any[]) => any } } T
 * @typedef {import('./types.js').Proxy<T>} Proxy<T>
 */

/**
 * @overload
 * Create a new worker pool
 * @param {WorkerPoolOptions} [script]
 * @returns {Pool} pool
 */
/**
 * @overload
 * Create a new worker pool
 * @param {string} [script]
 * @param {WorkerPoolOptions} [options]
 * @returns {Pool} pool
 */
function pool(script, options) {
  var Pool = require('./Pool');

  return new Pool(script, options);
};
exports.pool = pool;

/**
 * Create a worker and optionally register a set of methods to the worker.
 * @param {{ [k: string]: (...args: any[]) => any }} [methods]
 * @param {WorkerRegisterOptions} [options]
 */
function worker(methods, options) {
  var worker = require('./worker');
  worker.add(methods, options);
};
exports.worker = worker;

/**
 * Sends an event to the parent worker pool.
 * @param {any} payload 
 */
function workerEmit(payload) {
  var worker = require('./worker');
  worker.emit(payload);
};
exports.workerEmit = workerEmit;

const {Promise} = require('./Promise');
exports.Promise = Promise;

exports.Transfer = require('./transfer');

exports.platform = platform;
exports.isMainThread = isMainThread;
exports.cpus = cpus;
