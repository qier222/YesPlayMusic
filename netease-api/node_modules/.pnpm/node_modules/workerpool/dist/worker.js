/**
 * workerpool.js
 * https://github.com/josdejong/workerpool
 *
 * Offload tasks to a pool of workers on node.js and in the browser.
 *
 * @version 9.3.4
 * @date    2025-09-10
 *
 * @license
 * Copyright (C) 2014-2022 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.worker = factory());
})(this, (function () { 'use strict';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var worker$1 = {};

  /**
   * The helper class for transferring data from the worker to the main thread.
   *
   * @param {Object} message The object to deliver to the main thread.
   * @param {Object[]} transfer An array of transferable Objects to transfer ownership of.
   */
  function Transfer(message, transfer) {
    this.message = message;
    this.transfer = transfer;
  }
  var transfer = Transfer;

  var _Promise = {};

  /**
   * Promise
   *
   * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
   * @template T
   * @template [E=Error]
   * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
   * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
   */
  function Promise$1(handler, parent) {
    var me = this;
    if (!(this instanceof Promise$1)) {
      throw new SyntaxError('Constructor must be called with the new operator');
    }
    if (typeof handler !== 'function') {
      throw new SyntaxError('Function parameter handler(resolve, reject) missing');
    }
    var _onSuccess = [];
    var _onFail = [];

    // status
    /**
     * @readonly
     */
    this.resolved = false;
    /**
     * @readonly
     */
    this.rejected = false;
    /**
     * @readonly
     */
    this.pending = true;
    /**
     * @readonly
     */
    this[Symbol.toStringTag] = 'Promise';

    /**
     * Process onSuccess and onFail callbacks: add them to the queue.
     * Once the promise is resolved, the function _promise is replace.
     * @param {Function} onSuccess
     * @param {Function} onFail
     * @private
     */
    var _process = function _process(onSuccess, onFail) {
      _onSuccess.push(onSuccess);
      _onFail.push(onFail);
    };

    /**
     * Add an onSuccess callback and optionally an onFail callback to the Promise
     * @template TT
     * @template [TE=never]
     * @param {(r: T) => TT | PromiseLike<TT>} onSuccess
     * @param {(r: E) => TE | PromiseLike<TE>} [onFail]
     * @returns {Promise<TT | TE, any>} promise
     */
    this.then = function (onSuccess, onFail) {
      return new Promise$1(function (resolve, reject) {
        var s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
        var f = onFail ? _then(onFail, resolve, reject) : reject;
        _process(s, f);
      }, me);
    };

    /**
     * Resolve the promise
     * @param {*} result
     * @type {Function}
     */
    var _resolve2 = function _resolve(result) {
      // update status
      me.resolved = true;
      me.rejected = false;
      me.pending = false;
      _onSuccess.forEach(function (fn) {
        fn(result);
      });
      _process = function _process(onSuccess, onFail) {
        onSuccess(result);
      };
      _resolve2 = _reject2 = function _reject() {};
      return me;
    };

    /**
     * Reject the promise
     * @param {Error} error
     * @type {Function}
     */
    var _reject2 = function _reject(error) {
      // update status
      me.resolved = false;
      me.rejected = true;
      me.pending = false;
      _onFail.forEach(function (fn) {
        fn(error);
      });
      _process = function _process(onSuccess, onFail) {
        onFail(error);
      };
      _resolve2 = _reject2 = function _reject() {};
      return me;
    };

    /**
     * Cancel the promise. This will reject the promise with a CancellationError
     * @returns {this} self
     */
    this.cancel = function () {
      if (parent) {
        parent.cancel();
      } else {
        _reject2(new CancellationError());
      }
      return me;
    };

    /**
     * Set a timeout for the promise. If the promise is not resolved within
     * the time, the promise will be cancelled and a TimeoutError is thrown.
     * If the promise is resolved in time, the timeout is removed.
     * @param {number} delay     Delay in milliseconds
     * @returns {this} self
     */
    this.timeout = function (delay) {
      if (parent) {
        parent.timeout(delay);
      } else {
        var timer = setTimeout(function () {
          _reject2(new TimeoutError('Promise timed out after ' + delay + ' ms'));
        }, delay);
        me.always(function () {
          clearTimeout(timer);
        });
      }
      return me;
    };

    // attach handler passing the resolve and reject functions
    handler(function (result) {
      _resolve2(result);
    }, function (error) {
      _reject2(error);
    });
  }

  /**
   * Execute given callback, then call resolve/reject based on the returned result
   * @param {Function} callback
   * @param {Function} resolve
   * @param {Function} reject
   * @returns {Function}
   * @private
   */
  function _then(callback, resolve, reject) {
    return function (result) {
      try {
        var res = callback(result);
        if (res && typeof res.then === 'function' && typeof res['catch'] === 'function') {
          // method returned a promise
          res.then(resolve, reject);
        } else {
          resolve(res);
        }
      } catch (error) {
        reject(error);
      }
    };
  }

  /**
   * Add an onFail callback to the Promise
   * @template TT
   * @param {(error: E) => TT | PromiseLike<TT>} onFail
   * @returns {Promise<T | TT>} promise
   */
  Promise$1.prototype['catch'] = function (onFail) {
    return this.then(null, onFail);
  };

  // TODO: add support for Promise.catch(Error, callback)
  // TODO: add support for Promise.catch(Error, Error, callback)

  /**
   * Execute given callback when the promise either resolves or rejects.
   * @template TT
   * @param {() => Promise<TT>} fn
   * @returns {Promise<TT>} promise
   */
  Promise$1.prototype.always = function (fn) {
    return this.then(fn, fn);
  };

  /**
    * Execute given callback when the promise either resolves or rejects.
    * Same semantics as Node's Promise.finally()
    * @param {Function | null | undefined} [fn]
    * @returns {Promise} promise
    */
  Promise$1.prototype.finally = function (fn) {
    var me = this;
    var final = function final() {
      return new Promise$1(function (resolve) {
        return resolve();
      }).then(fn).then(function () {
        return me;
      });
    };
    return this.then(final, final);
  };

  /**
   * Create a promise which resolves when all provided promises are resolved,
   * and fails when any of the promises resolves.
   * @param {Promise[]} promises
   * @returns {Promise<any[], any>} promise
   */
  Promise$1.all = function (promises) {
    return new Promise$1(function (resolve, reject) {
      var remaining = promises.length,
        results = [];
      if (remaining) {
        promises.forEach(function (p, i) {
          p.then(function (result) {
            results[i] = result;
            remaining--;
            if (remaining == 0) {
              resolve(results);
            }
          }, function (error) {
            remaining = 0;
            reject(error);
          });
        });
      } else {
        resolve(results);
      }
    });
  };

  /**
   * Create a promise resolver
   * @returns {{promise: Promise, resolve: Function, reject: Function}} resolver
   */
  Promise$1.defer = function () {
    var resolver = {};
    resolver.promise = new Promise$1(function (resolve, reject) {
      resolver.resolve = resolve;
      resolver.reject = reject;
    });
    return resolver;
  };

  /**
   * Create a cancellation error
   * @param {String} [message]
   * @extends Error
   */
  function CancellationError(message) {
    this.message = message || 'promise cancelled';
    this.stack = new Error().stack;
  }
  CancellationError.prototype = new Error();
  CancellationError.prototype.constructor = Error;
  CancellationError.prototype.name = 'CancellationError';
  Promise$1.CancellationError = CancellationError;

  /**
   * Create a timeout error
   * @param {String} [message]
   * @extends Error
   */
  function TimeoutError(message) {
    this.message = message || 'timeout exceeded';
    this.stack = new Error().stack;
  }
  TimeoutError.prototype = new Error();
  TimeoutError.prototype.constructor = Error;
  TimeoutError.prototype.name = 'TimeoutError';
  Promise$1.TimeoutError = TimeoutError;
  _Promise.Promise = Promise$1;

  (function (exports) {
    var Transfer = transfer;

    /**
     * worker must handle async cleanup handlers. Use custom Promise implementation. 
    */
    var Promise = _Promise.Promise;
    /**
     * Special message sent by parent which causes the worker to terminate itself.
     * Not a "message object"; this string is the entire message.
     */
    var TERMINATE_METHOD_ID = '__workerpool-terminate__';

    /**
     * Special message by parent which causes a child process worker to perform cleaup
     * steps before determining if the child process worker should be terminated.
    */
    var CLEANUP_METHOD_ID = '__workerpool-cleanup__';
    // var nodeOSPlatform = require('./environment').nodeOSPlatform;

    var TIMEOUT_DEFAULT = 1000;

    // create a worker API for sending and receiving messages which works both on
    // node.js and in the browser
    var worker = {
      exit: function exit() {}
    };

    // api for in worker communication with parent process
    // works in both node.js and the browser
    var publicWorker = {
      /**
       * Registers listeners which will trigger when a task is timed out or cancled. If all listeners resolve, the worker executing the given task will not be terminated.
       * *Note*: If there is a blocking operation within a listener, the worker will be terminated.
       * @param {() => Promise<void>} listener
      */
      addAbortListener: function addAbortListener(listener) {
        worker.abortListeners.push(listener);
      },
      /**
        * Emit an event from the worker thread to the main thread.
        * @param {any} payload
      */
      emit: worker.emit
    };
    if (typeof self !== 'undefined' && typeof postMessage === 'function' && typeof addEventListener === 'function') {
      // worker in the browser
      worker.on = function (event, callback) {
        addEventListener(event, function (message) {
          callback(message.data);
        });
      };
      worker.send = function (message, transfer) {
        transfer ? postMessage(message, transfer) : postMessage(message);
      };
    } else if (typeof process !== 'undefined') {
      // node.js

      var WorkerThreads;
      try {
        WorkerThreads = require('worker_threads');
      } catch (error) {
        if (_typeof(error) === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND') ; else {
          throw error;
        }
      }
      if (WorkerThreads && /* if there is a parentPort, we are in a WorkerThread */
      WorkerThreads.parentPort !== null) {
        var parentPort = WorkerThreads.parentPort;
        worker.send = parentPort.postMessage.bind(parentPort);
        worker.on = parentPort.on.bind(parentPort);
        worker.exit = process.exit.bind(process);
      } else {
        worker.on = process.on.bind(process);
        // ignore transfer argument since it is not supported by process
        worker.send = function (message) {
          process.send(message);
        };
        // register disconnect handler only for subprocess worker to exit when parent is killed unexpectedly
        worker.on('disconnect', function () {
          process.exit(1);
        });
        worker.exit = process.exit.bind(process);
      }
    } else {
      throw new Error('Script must be executed as a worker');
    }
    function convertError(error) {
      if (error && error.toJSON) {
        return JSON.parse(JSON.stringify(error));
      }

      // turn a class like Error (having non-enumerable properties) into a plain object
      return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }

    /**
     * Test whether a value is a Promise via duck typing.
     * @param {*} value
     * @returns {boolean} Returns true when given value is an object
     *                    having functions `then` and `catch`.
     */
    function isPromise(value) {
      return value && typeof value.then === 'function' && typeof value.catch === 'function';
    }

    // functions available externally
    worker.methods = {};

    /**
     * Execute a function with provided arguments
     * @param {String} fn     Stringified function
     * @param {Array} [args]  Function arguments
     * @returns {*}
     */
    worker.methods.run = function run(fn, args) {
      var f = new Function('return (' + fn + ').apply(this, arguments);');
      f.worker = publicWorker;
      return f.apply(f, args);
    };

    /**
     * Get a list with methods available on this worker
     * @return {String[]} methods
     */
    worker.methods.methods = function methods() {
      return Object.keys(worker.methods);
    };

    /**
     * Custom handler for when the worker is terminated.
     */
    worker.terminationHandler = undefined;
    worker.abortListenerTimeout = TIMEOUT_DEFAULT;

    /**
     * Abort handlers for resolving errors which may cause a timeout or cancellation
     * to occur from a worker context
     */
    worker.abortListeners = [];

    /**
     * Cleanup and exit the worker.
     * @param {Number} code 
     * @returns {Promise<void>}
     */
    worker.terminateAndExit = function (code) {
      var _exit = function _exit() {
        worker.exit(code);
      };
      if (!worker.terminationHandler) {
        return _exit();
      }
      var result = worker.terminationHandler(code);
      if (isPromise(result)) {
        result.then(_exit, _exit);
        return result;
      } else {
        _exit();
        return new Promise(function (_resolve, reject) {
          reject(new Error("Worker terminating"));
        });
      }
    };

    /**
      * Called within the worker message handler to run abort handlers if registered to perform cleanup operations.
      * @param {Integer} [requestId] id of task which is currently executing in the worker
      * @return {Promise<void>}
    */
    worker.cleanup = function (requestId) {
      if (!worker.abortListeners.length) {
        worker.send({
          id: requestId,
          method: CLEANUP_METHOD_ID,
          error: convertError(new Error('Worker terminating'))
        });

        // If there are no handlers registered, reject the promise with an error as we want the handler to be notified
        // that cleanup should begin and the handler should be GCed.
        return new Promise(function (resolve) {
          resolve();
        });
      }
      var _exit = function _exit() {
        worker.exit();
      };
      var _abort = function _abort() {
        if (!worker.abortListeners.length) {
          worker.abortListeners = [];
        }
      };
      var promises = worker.abortListeners.map(function (listener) {
        return listener();
      });
      var timerId;
      var timeoutPromise = new Promise(function (_resolve, reject) {
        timerId = setTimeout(function () {
          reject(new Error('Timeout occured waiting for abort handler, killing worker'));
        }, worker.abortListenerTimeout);
      });

      // Once a promise settles we need to clear the timeout to prevet fulfulling the promise twice 
      var settlePromise = Promise.all(promises).then(function () {
        clearTimeout(timerId);
        _abort();
      }, function () {
        clearTimeout(timerId);
        _exit();
      });

      // Returns a promise which will result in one of the following cases
      // - Resolve once all handlers resolve
      // - Reject if one or more handlers exceed the 'abortListenerTimeout' interval
      // - Reject if one or more handlers reject
      // Upon one of the above cases a message will be sent to the handler with the result of the handler execution
      // which will either kill the worker if the result contains an error, or keep it in the pool if the result
      // does not contain an error.
      return new Promise(function (resolve, reject) {
        settlePromise.then(resolve, reject);
        timeoutPromise.then(resolve, reject);
      }).then(function () {
        worker.send({
          id: requestId,
          method: CLEANUP_METHOD_ID,
          error: null
        });
      }, function (err) {
        worker.send({
          id: requestId,
          method: CLEANUP_METHOD_ID,
          error: err ? convertError(err) : null
        });
      });
    };
    var currentRequestId = null;
    worker.on('message', function (request) {
      if (request === TERMINATE_METHOD_ID) {
        return worker.terminateAndExit(0);
      }
      if (request.method === CLEANUP_METHOD_ID) {
        return worker.cleanup(request.id);
      }
      try {
        var method = worker.methods[request.method];
        if (method) {
          currentRequestId = request.id;

          // execute the function
          var result = method.apply(method, request.params);
          if (isPromise(result)) {
            // promise returned, resolve this and then return
            result.then(function (result) {
              if (result instanceof Transfer) {
                worker.send({
                  id: request.id,
                  result: result.message,
                  error: null
                }, result.transfer);
              } else {
                worker.send({
                  id: request.id,
                  result: result,
                  error: null
                });
              }
              currentRequestId = null;
            }).catch(function (err) {
              worker.send({
                id: request.id,
                result: null,
                error: convertError(err)
              });
              currentRequestId = null;
            });
          } else {
            // immediate result
            if (result instanceof Transfer) {
              worker.send({
                id: request.id,
                result: result.message,
                error: null
              }, result.transfer);
            } else {
              worker.send({
                id: request.id,
                result: result,
                error: null
              });
            }
            currentRequestId = null;
          }
        } else {
          throw new Error('Unknown method "' + request.method + '"');
        }
      } catch (err) {
        worker.send({
          id: request.id,
          result: null,
          error: convertError(err)
        });
      }
    });

    /**
     * Register methods to the worker
     * @param {Object} [methods]
     * @param {import('./types.js').WorkerRegisterOptions} [options]
     */
    worker.register = function (methods, options) {
      if (methods) {
        for (var name in methods) {
          if (methods.hasOwnProperty(name)) {
            worker.methods[name] = methods[name];
            worker.methods[name].worker = publicWorker;
          }
        }
      }
      if (options) {
        worker.terminationHandler = options.onTerminate;
        // register listener timeout or default to 1 second
        worker.abortListenerTimeout = options.abortListenerTimeout || TIMEOUT_DEFAULT;
      }
      worker.send('ready');
    };
    worker.emit = function (payload) {
      if (currentRequestId) {
        if (payload instanceof Transfer) {
          worker.send({
            id: currentRequestId,
            isEvent: true,
            payload: payload.message
          }, payload.transfer);
          return;
        }
        worker.send({
          id: currentRequestId,
          isEvent: true,
          payload: payload
        });
      }
    };
    {
      exports.add = worker.register;
      exports.emit = worker.emit;
    }
  })(worker$1);
  var worker = /*@__PURE__*/getDefaultExportFromCjs(worker$1);

  return worker;

}));
//# sourceMappingURL=worker.js.map
