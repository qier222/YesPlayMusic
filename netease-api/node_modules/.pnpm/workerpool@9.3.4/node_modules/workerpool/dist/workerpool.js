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
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.workerpool = {}));
})(this, (function (exports) { 'use strict';

  var src = {};

  var environment = {exports: {}};

  (function (module) {
    // source: https://github.com/flexdinesh/browser-or-node
    // source: https://github.com/mozilla/pdf.js/blob/7ea0e40e588864cd938d1836ec61f1928d3877d3/src/shared/util.js#L24
    var isNode = function isNode(nodeProcess) {
      return typeof nodeProcess !== 'undefined' && nodeProcess.versions != null && nodeProcess.versions.node != null && nodeProcess + '' === '[object process]';
    };
    module.exports.isNode = isNode;

    // determines the JavaScript platform: browser or node
    module.exports.platform = typeof process !== 'undefined' && isNode(process) ? 'node' : 'browser';

    // determines whether the code is running in main thread or not
    // note that in node.js we have to check both worker_thread and child_process
    var worker_threads = module.exports.platform === 'node' && require('worker_threads');
    module.exports.isMainThread = module.exports.platform === 'node' ? (!worker_threads || worker_threads.isMainThread) && !process.connected : typeof Window !== 'undefined';

    // determines the number of cpus available
    module.exports.cpus = module.exports.platform === 'browser' ? self.navigator.hardwareConcurrency : require('os').cpus().length;
  })(environment);
  var environmentExports = environment.exports;

  var _Promise$1 = {};

  var hasRequired_Promise;
  function require_Promise() {
    if (hasRequired_Promise) return _Promise$1;
    hasRequired_Promise = 1;

    /**
     * Promise
     *
     * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
     * @template T
     * @template [E=Error]
     * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
     * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
     */
    function Promise(handler, parent) {
      var me = this;
      if (!(this instanceof Promise)) {
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
        return new Promise(function (resolve, reject) {
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
    Promise.prototype['catch'] = function (onFail) {
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
    Promise.prototype.always = function (fn) {
      return this.then(fn, fn);
    };

    /**
      * Execute given callback when the promise either resolves or rejects.
      * Same semantics as Node's Promise.finally()
      * @param {Function | null | undefined} [fn]
      * @returns {Promise} promise
      */
    Promise.prototype.finally = function (fn) {
      var me = this;
      var final = function final() {
        return new Promise(function (resolve) {
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
    Promise.all = function (promises) {
      return new Promise(function (resolve, reject) {
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
    Promise.defer = function () {
      var resolver = {};
      resolver.promise = new Promise(function (resolve, reject) {
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
    Promise.CancellationError = CancellationError;

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
    Promise.TimeoutError = TimeoutError;
    _Promise$1.Promise = Promise;
    return _Promise$1;
  }

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
        t && (r = t);
        var n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return n >= r.length ? {
              done: true
            } : {
              done: false,
              value: r[n++]
            };
          },
          e: function (r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = true,
      u = false;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r = t.next();
        return a = r.done, r;
      },
      e: function (r) {
        u = true, o = r;
      },
      f: function () {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  var WorkerHandler = {exports: {}};

  var validateOptions = {};

  /**
   * Validate that the object only contains known option names
   * - Throws an error when unknown options are detected
   * - Throws an error when some of the allowed options are attached
   * @param {Object | undefined} options
   * @param {string[]} allowedOptionNames
   * @param {string} objectName
   * @retrun {Object} Returns the original options
   */
  var hasRequiredValidateOptions;
  function requireValidateOptions() {
    if (hasRequiredValidateOptions) return validateOptions;
    hasRequiredValidateOptions = 1;
    validateOptions.validateOptions = function validateOptions(options, allowedOptionNames, objectName) {
      if (!options) {
        return;
      }
      var optionNames = options ? Object.keys(options) : [];

      // check for unknown properties
      var unknownOptionName = optionNames.find(function (optionName) {
        return !allowedOptionNames.includes(optionName);
      });
      if (unknownOptionName) {
        throw new Error('Object "' + objectName + '" contains an unknown option "' + unknownOptionName + '"');
      }

      // check for inherited properties which are not present on the object itself
      var illegalOptionName = allowedOptionNames.find(function (allowedOptionName) {
        return Object.prototype[allowedOptionName] && !optionNames.includes(allowedOptionName);
      });
      if (illegalOptionName) {
        throw new Error('Object "' + objectName + '" contains an inherited option "' + illegalOptionName + '" which is ' + 'not defined in the object itself but in its prototype. Only plain objects are allowed. ' + 'Please remove the option from the prototype or override it with a value "undefined".');
      }
      return options;
    };

    // source: https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
    validateOptions.workerOptsNames = ['credentials', 'name', 'type'];

    // source: https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options
    validateOptions.forkOptsNames = ['cwd', 'detached', 'env', 'execPath', 'execArgv', 'gid', 'serialization', 'signal', 'killSignal', 'silent', 'stdio', 'uid', 'windowsVerbatimArguments', 'timeout'];

    // source: https://nodejs.org/api/worker_threads.html#new-workerfilename-options
    validateOptions.workerThreadOptsNames = ['argv', 'env', 'eval', 'execArgv', 'stdin', 'stdout', 'stderr', 'workerData', 'trackUnmanagedFds', 'transferList', 'resourceLimits', 'name'];
    return validateOptions;
  }

  /**
   * embeddedWorker.js contains an embedded version of worker.js.
   * This file is automatically generated,
   * changes made in this file will be overwritten.
   */
  var embeddedWorker;
  var hasRequiredEmbeddedWorker;
  function requireEmbeddedWorker() {
    if (hasRequiredEmbeddedWorker) return embeddedWorker;
    hasRequiredEmbeddedWorker = 1;
    embeddedWorker = "!function(e,n){\"object\"==typeof exports&&\"undefined\"!=typeof module?module.exports=n():\"function\"==typeof define&&define.amd?define(n):(e=\"undefined\"!=typeof globalThis?globalThis:e||self).worker=n()}(this,(function(){\"use strict\";function e(n){return e=\"function\"==typeof Symbol&&\"symbol\"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&\"function\"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?\"symbol\":typeof e},e(n)}function n(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,\"default\")?e.default:e}var t={};var r=function(e,n){this.message=e,this.transfer=n},o={};function i(e,n){var t=this;if(!(this instanceof i))throw new SyntaxError(\"Constructor must be called with the new operator\");if(\"function\"!=typeof e)throw new SyntaxError(\"Function parameter handler(resolve, reject) missing\");var r=[],o=[];this.resolved=!1,this.rejected=!1,this.pending=!0,this[Symbol.toStringTag]=\"Promise\";var a=function(e,n){r.push(e),o.push(n)};this.then=function(e,n){return new i((function(t,r){var o=e?s(e,t,r):t,i=n?s(n,t,r):r;a(o,i)}),t)};var f=function(e){return t.resolved=!0,t.rejected=!1,t.pending=!1,r.forEach((function(n){n(e)})),a=function(n,t){n(e)},f=d=function(){},t},d=function(e){return t.resolved=!1,t.rejected=!0,t.pending=!1,o.forEach((function(n){n(e)})),a=function(n,t){t(e)},f=d=function(){},t};this.cancel=function(){return n?n.cancel():d(new u),t},this.timeout=function(e){if(n)n.timeout(e);else{var r=setTimeout((function(){d(new c(\"Promise timed out after \"+e+\" ms\"))}),e);t.always((function(){clearTimeout(r)}))}return t},e((function(e){f(e)}),(function(e){d(e)}))}function s(e,n,t){return function(r){try{var o=e(r);o&&\"function\"==typeof o.then&&\"function\"==typeof o.catch?o.then(n,t):n(o)}catch(e){t(e)}}}function u(e){this.message=e||\"promise cancelled\",this.stack=(new Error).stack}function c(e){this.message=e||\"timeout exceeded\",this.stack=(new Error).stack}return i.prototype.catch=function(e){return this.then(null,e)},i.prototype.always=function(e){return this.then(e,e)},i.prototype.finally=function(e){var n=this,t=function(){return new i((function(e){return e()})).then(e).then((function(){return n}))};return this.then(t,t)},i.all=function(e){return new i((function(n,t){var r=e.length,o=[];r?e.forEach((function(e,i){e.then((function(e){o[i]=e,0==--r&&n(o)}),(function(e){r=0,t(e)}))})):n(o)}))},i.defer=function(){var e={};return e.promise=new i((function(n,t){e.resolve=n,e.reject=t})),e},u.prototype=new Error,u.prototype.constructor=Error,u.prototype.name=\"CancellationError\",i.CancellationError=u,c.prototype=new Error,c.prototype.constructor=Error,c.prototype.name=\"TimeoutError\",i.TimeoutError=c,o.Promise=i,function(n){var t=r,i=o.Promise,s=\"__workerpool-cleanup__\",u={exit:function(){}},c={addAbortListener:function(e){u.abortListeners.push(e)},emit:u.emit};if(\"undefined\"!=typeof self&&\"function\"==typeof postMessage&&\"function\"==typeof addEventListener)u.on=function(e,n){addEventListener(e,(function(e){n(e.data)}))},u.send=function(e,n){n?postMessage(e,n):postMessage(e)};else{if(\"undefined\"==typeof process)throw new Error(\"Script must be executed as a worker\");var a;try{a=require(\"worker_threads\")}catch(n){if(\"object\"!==e(n)||null===n||\"MODULE_NOT_FOUND\"!==n.code)throw n}if(a&&null!==a.parentPort){var f=a.parentPort;u.send=f.postMessage.bind(f),u.on=f.on.bind(f),u.exit=process.exit.bind(process)}else u.on=process.on.bind(process),u.send=function(e){process.send(e)},u.on(\"disconnect\",(function(){process.exit(1)})),u.exit=process.exit.bind(process)}function d(e){return e&&e.toJSON?JSON.parse(JSON.stringify(e)):JSON.parse(JSON.stringify(e,Object.getOwnPropertyNames(e)))}function l(e){return e&&\"function\"==typeof e.then&&\"function\"==typeof e.catch}u.methods={},u.methods.run=function(e,n){var t=new Function(\"return (\"+e+\").apply(this, arguments);\");return t.worker=c,t.apply(t,n)},u.methods.methods=function(){return Object.keys(u.methods)},u.terminationHandler=void 0,u.abortListenerTimeout=1e3,u.abortListeners=[],u.terminateAndExit=function(e){var n=function(){u.exit(e)};if(!u.terminationHandler)return n();var t=u.terminationHandler(e);return l(t)?(t.then(n,n),t):(n(),new i((function(e,n){n(new Error(\"Worker terminating\"))})))},u.cleanup=function(e){if(!u.abortListeners.length)return u.send({id:e,method:s,error:d(new Error(\"Worker terminating\"))}),new i((function(e){e()}));var n,t=u.abortListeners.map((function(e){return e()})),r=new i((function(e,t){n=setTimeout((function(){t(new Error(\"Timeout occured waiting for abort handler, killing worker\"))}),u.abortListenerTimeout)})),o=i.all(t).then((function(){clearTimeout(n),u.abortListeners.length||(u.abortListeners=[])}),(function(){clearTimeout(n),u.exit()}));return new i((function(e,n){o.then(e,n),r.then(e,n)})).then((function(){u.send({id:e,method:s,error:null})}),(function(n){u.send({id:e,method:s,error:n?d(n):null})}))};var p=null;u.on(\"message\",(function(e){if(\"__workerpool-terminate__\"===e)return u.terminateAndExit(0);if(e.method===s)return u.cleanup(e.id);try{var n=u.methods[e.method];if(!n)throw new Error('Unknown method \"'+e.method+'\"');p=e.id;var r=n.apply(n,e.params);l(r)?r.then((function(n){n instanceof t?u.send({id:e.id,result:n.message,error:null},n.transfer):u.send({id:e.id,result:n,error:null}),p=null})).catch((function(n){u.send({id:e.id,result:null,error:d(n)}),p=null})):(r instanceof t?u.send({id:e.id,result:r.message,error:null},r.transfer):u.send({id:e.id,result:r,error:null}),p=null)}catch(n){u.send({id:e.id,result:null,error:d(n)})}})),u.register=function(e,n){if(e)for(var t in e)e.hasOwnProperty(t)&&(u.methods[t]=e[t],u.methods[t].worker=c);n&&(u.terminationHandler=n.onTerminate,u.abortListenerTimeout=n.abortListenerTimeout||1e3),u.send(\"ready\")},u.emit=function(e){if(p){if(e instanceof t)return void u.send({id:p,isEvent:!0,payload:e.message},e.transfer);u.send({id:p,isEvent:!0,payload:e})}},n.add=u.register,n.emit=u.emit}(t),n(t)}));\n//# sourceMappingURL=worker.min.js.map\n";
    return embeddedWorker;
  }

  var hasRequiredWorkerHandler;
  function requireWorkerHandler() {
    if (hasRequiredWorkerHandler) return WorkerHandler.exports;
    hasRequiredWorkerHandler = 1;
    var _require$$ = require_Promise(),
      Promise = _require$$.Promise;
    var environment = environmentExports;
    var _require$$2 = requireValidateOptions(),
      validateOptions = _require$$2.validateOptions,
      forkOptsNames = _require$$2.forkOptsNames,
      workerThreadOptsNames = _require$$2.workerThreadOptsNames,
      workerOptsNames = _require$$2.workerOptsNames;

    /**
     * Special message sent by parent which causes a child process worker to terminate itself.
     * Not a "message object"; this string is the entire message.
     */
    var TERMINATE_METHOD_ID = '__workerpool-terminate__';

    /**
     * Special message by parent which causes a child process worker to perform cleaup
     * steps before determining if the child process worker should be terminated.
     */
    var CLEANUP_METHOD_ID = '__workerpool-cleanup__';
    function ensureWorkerThreads() {
      var WorkerThreads = tryRequireWorkerThreads();
      if (!WorkerThreads) {
        throw new Error('WorkerPool: workerType = \'thread\' is not supported, Node >= 11.7.0 required');
      }
      return WorkerThreads;
    }

    // check whether Worker is supported by the browser
    function ensureWebWorker() {
      // Workaround for a bug in PhantomJS (Or QtWebkit): https://github.com/ariya/phantomjs/issues/14534
      if (typeof Worker !== 'function' && ((typeof Worker === "undefined" ? "undefined" : _typeof(Worker)) !== 'object' || typeof Worker.prototype.constructor !== 'function')) {
        throw new Error('WorkerPool: Web Workers not supported');
      }
    }
    function tryRequireWorkerThreads() {
      try {
        return require('worker_threads');
      } catch (error) {
        if (_typeof(error) === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND') {
          // no worker_threads available (old version of node.js)
          return null;
        } else {
          throw error;
        }
      }
    }

    // get the default worker script
    function getDefaultWorker() {
      if (environment.platform === 'browser') {
        // test whether the browser supports all features that we need
        if (typeof Blob === 'undefined') {
          throw new Error('Blob not supported by the browser');
        }
        if (!window.URL || typeof window.URL.createObjectURL !== 'function') {
          throw new Error('URL.createObjectURL not supported by the browser');
        }

        // use embedded worker.js
        var blob = new Blob([requireEmbeddedWorker()], {
          type: 'text/javascript'
        });
        return window.URL.createObjectURL(blob);
      } else {
        // use external worker.js in current directory
        return __dirname + '/worker.js';
      }
    }
    function setupWorker(script, options) {
      if (options.workerType === 'web') {
        // browser only
        ensureWebWorker();
        return setupBrowserWorker(script, options.workerOpts, Worker);
      } else if (options.workerType === 'thread') {
        // node.js only
        WorkerThreads = ensureWorkerThreads();
        return setupWorkerThreadWorker(script, WorkerThreads, options);
      } else if (options.workerType === 'process' || !options.workerType) {
        // node.js only
        return setupProcessWorker(script, resolveForkOptions(options), require('child_process'));
      } else {
        // options.workerType === 'auto' or undefined
        if (environment.platform === 'browser') {
          ensureWebWorker();
          return setupBrowserWorker(script, options.workerOpts, Worker);
        } else {
          // environment.platform === 'node'
          var WorkerThreads = tryRequireWorkerThreads();
          if (WorkerThreads) {
            return setupWorkerThreadWorker(script, WorkerThreads, options);
          } else {
            return setupProcessWorker(script, resolveForkOptions(options), require('child_process'));
          }
        }
      }
    }
    function setupBrowserWorker(script, workerOpts, Worker) {
      // validate the options right before creating the worker (not when creating the pool)
      validateOptions(workerOpts, workerOptsNames, 'workerOpts');

      // create the web worker
      var worker = new Worker(script, workerOpts);
      worker.isBrowserWorker = true;
      // add node.js API to the web worker
      worker.on = function (event, callback) {
        this.addEventListener(event, function (message) {
          callback(message.data);
        });
      };
      worker.send = function (message, transfer) {
        this.postMessage(message, transfer);
      };
      return worker;
    }
    function setupWorkerThreadWorker(script, WorkerThreads, options) {
      var _options$emitStdStrea, _options$emitStdStrea2;
      // validate the options right before creating the worker thread (not when creating the pool)
      validateOptions(options === null || options === void 0 ? void 0 : options.workerThreadOpts, workerThreadOptsNames, 'workerThreadOpts');
      var worker = new WorkerThreads.Worker(script, _objectSpread2({
        stdout: (_options$emitStdStrea = options === null || options === void 0 ? void 0 : options.emitStdStreams) !== null && _options$emitStdStrea !== void 0 ? _options$emitStdStrea : false,
        // pipe worker.STDOUT to process.STDOUT if not requested
        stderr: (_options$emitStdStrea2 = options === null || options === void 0 ? void 0 : options.emitStdStreams) !== null && _options$emitStdStrea2 !== void 0 ? _options$emitStdStrea2 : false
      }, options === null || options === void 0 ? void 0 : options.workerThreadOpts));
      worker.isWorkerThread = true;
      worker.send = function (message, transfer) {
        this.postMessage(message, transfer);
      };
      worker.kill = function () {
        this.terminate();
        return true;
      };
      worker.disconnect = function () {
        this.terminate();
      };
      if (options !== null && options !== void 0 && options.emitStdStreams) {
        worker.stdout.on('data', function (data) {
          return worker.emit("stdout", data);
        });
        worker.stderr.on('data', function (data) {
          return worker.emit("stderr", data);
        });
      }
      return worker;
    }
    function setupProcessWorker(script, options, child_process) {
      // validate the options right before creating the child process (not when creating the pool)
      validateOptions(options.forkOpts, forkOptsNames, 'forkOpts');

      // no WorkerThreads, fallback to sub-process based workers
      var worker = child_process.fork(script, options.forkArgs, options.forkOpts);

      // ignore transfer argument since it is not supported by process
      var send = worker.send;
      worker.send = function (message) {
        return send.call(worker, message);
      };
      if (options.emitStdStreams) {
        worker.stdout.on('data', function (data) {
          return worker.emit("stdout", data);
        });
        worker.stderr.on('data', function (data) {
          return worker.emit("stderr", data);
        });
      }
      worker.isChildProcess = true;
      return worker;
    }

    // add debug flags to child processes if the node inspector is active
    function resolveForkOptions(opts) {
      opts = opts || {};
      var processExecArgv = process.execArgv.join(' ');
      var inspectorActive = processExecArgv.indexOf('--inspect') !== -1;
      var debugBrk = processExecArgv.indexOf('--debug-brk') !== -1;
      var execArgv = [];
      if (inspectorActive) {
        execArgv.push('--inspect=' + opts.debugPort);
        if (debugBrk) {
          execArgv.push('--debug-brk');
        }
      }
      process.execArgv.forEach(function (arg) {
        if (arg.indexOf('--max-old-space-size') > -1) {
          execArgv.push(arg);
        }
      });
      return Object.assign({}, opts, {
        forkArgs: opts.forkArgs,
        forkOpts: Object.assign({}, opts.forkOpts, {
          execArgv: (opts.forkOpts && opts.forkOpts.execArgv || []).concat(execArgv),
          stdio: opts.emitStdStreams ? "pipe" : undefined
        })
      });
    }

    /**
     * Converts a serialized error to Error
     * @param {Object} obj Error that has been serialized and parsed to object
     * @return {Error} The equivalent Error.
     */
    function objectToError(obj) {
      var temp = new Error('');
      var props = Object.keys(obj);
      for (var i = 0; i < props.length; i++) {
        temp[props[i]] = obj[props[i]];
      }
      return temp;
    }
    function handleEmittedStdPayload(handler, payload) {
      // TODO: refactor if parallel task execution gets added
      Object.values(handler.processing).forEach(function (task) {
        var _task$options;
        return task === null || task === void 0 || (_task$options = task.options) === null || _task$options === void 0 ? void 0 : _task$options.on(payload);
      });
      Object.values(handler.tracking).forEach(function (task) {
        var _task$options2;
        return task === null || task === void 0 || (_task$options2 = task.options) === null || _task$options2 === void 0 ? void 0 : _task$options2.on(payload);
      });
    }

    /**
     * A WorkerHandler controls a single worker. This worker can be a child process
     * on node.js or a WebWorker in a browser environment.
     * @param {String} [script] If no script is provided, a default worker with a
     *                          function run will be created.
     * @param {import('./types.js').WorkerPoolOptions} [_options] See docs
     * @constructor
     */
    function WorkerHandler$1(script, _options) {
      var me = this;
      var options = _options || {};
      this.script = script || getDefaultWorker();
      this.worker = setupWorker(this.script, options);
      this.debugPort = options.debugPort;
      this.forkOpts = options.forkOpts;
      this.forkArgs = options.forkArgs;
      this.workerOpts = options.workerOpts;
      this.workerThreadOpts = options.workerThreadOpts;
      this.workerTerminateTimeout = options.workerTerminateTimeout;

      // The ready message is only sent if the worker.add method is called (And the default script is not used)
      if (!script) {
        this.worker.ready = true;
      }

      // queue for requests that are received before the worker is ready
      this.requestQueue = [];
      this.worker.on("stdout", function (data) {
        handleEmittedStdPayload(me, {
          "stdout": data.toString()
        });
      });
      this.worker.on("stderr", function (data) {
        handleEmittedStdPayload(me, {
          "stderr": data.toString()
        });
      });
      this.worker.on('message', function (response) {
        if (me.terminated) {
          return;
        }
        if (typeof response === 'string' && response === 'ready') {
          me.worker.ready = true;
          dispatchQueuedRequests();
        } else {
          // find the task from the processing queue, and run the tasks callback
          var id = response.id;
          var task = me.processing[id];
          if (task !== undefined) {
            if (response.isEvent) {
              if (task.options && typeof task.options.on === 'function') {
                task.options.on(response.payload);
              }
            } else {
              // remove the task from the queue
              delete me.processing[id];

              // test if we need to terminate
              if (me.terminating === true) {
                // complete worker termination if all tasks are finished
                me.terminate();
              }

              // resolve the task's promise
              if (response.error) {
                task.resolver.reject(objectToError(response.error));
              } else {
                task.resolver.resolve(response.result);
              }
            }
          } else {
            // if the task is not the current, it might be tracked for cleanup
            var task = me.tracking[id];
            if (task !== undefined) {
              if (response.isEvent) {
                if (task.options && typeof task.options.on === 'function') {
                  task.options.on(response.payload);
                }
              }
            }
          }
          if (response.method === CLEANUP_METHOD_ID) {
            var trackedTask = me.tracking[response.id];
            if (trackedTask !== undefined) {
              if (response.error) {
                clearTimeout(trackedTask.timeoutId);
                trackedTask.resolver.reject(objectToError(response.error));
              } else {
                me.tracking && clearTimeout(trackedTask.timeoutId);
                // if we do not encounter an error wrap the the original timeout error and reject
                trackedTask.resolver.reject(new WrappedTimeoutError(trackedTask.error));
              }
            }
            delete me.tracking[id];
          }
        }
      });

      // reject all running tasks on worker error
      function onError(error) {
        me.terminated = true;
        for (var id in me.processing) {
          if (me.processing[id] !== undefined) {
            me.processing[id].resolver.reject(error);
          }
        }
        me.processing = Object.create(null);
      }

      // send all queued requests to worker
      function dispatchQueuedRequests() {
        var _iterator = _createForOfIteratorHelper(me.requestQueue.splice(0)),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var request = _step.value;
            me.worker.send(request.message, request.transfer);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      var worker = this.worker;
      // listen for worker messages error and exit
      this.worker.on('error', onError);
      this.worker.on('exit', function (exitCode, signalCode) {
        var message = 'Workerpool Worker terminated Unexpectedly\n';
        message += '    exitCode: `' + exitCode + '`\n';
        message += '    signalCode: `' + signalCode + '`\n';
        message += '    workerpool.script: `' + me.script + '`\n';
        message += '    spawnArgs: `' + worker.spawnargs + '`\n';
        message += '    spawnfile: `' + worker.spawnfile + '`\n';
        message += '    stdout: `' + worker.stdout + '`\n';
        message += '    stderr: `' + worker.stderr + '`\n';
        onError(new Error(message));
      });
      this.processing = Object.create(null); // queue with tasks currently in progress
      this.tracking = Object.create(null); // queue with tasks being monitored for cleanup status
      this.terminating = false;
      this.terminated = false;
      this.cleaning = false;
      this.terminationHandler = null;
      this.lastId = 0;
    }

    /**
     * Get a list with methods available on the worker.
     * @return {Promise.<String[], Error>} methods
     */
    WorkerHandler$1.prototype.methods = function () {
      return this.exec('methods');
    };

    /**
     * Execute a method with given parameters on the worker
     * @param {String} method
     * @param {Array} [params]
     * @param {{resolve: Function, reject: Function}} [resolver]
     * @param {import('./types.js').ExecOptions}  [options]
     * @return {Promise.<*, Error>} result
     */
    WorkerHandler$1.prototype.exec = function (method, params, resolver, options) {
      if (!resolver) {
        resolver = Promise.defer();
      }

      // generate a unique id for the task
      var id = ++this.lastId;

      // register a new task as being in progress
      this.processing[id] = {
        id: id,
        resolver: resolver,
        options: options
      };

      // build a JSON-RPC request
      var request = {
        message: {
          id: id,
          method: method,
          params: params
        },
        transfer: options && options.transfer
      };
      if (this.terminated) {
        resolver.reject(new Error('Worker is terminated'));
      } else if (this.worker.ready) {
        // send the request to the worker
        this.worker.send(request.message, request.transfer);
      } else {
        this.requestQueue.push(request);
      }

      // on cancellation, force the worker to terminate
      var me = this;
      return resolver.promise.catch(function (error) {
        if (error instanceof Promise.CancellationError || error instanceof Promise.TimeoutError) {
          me.tracking[id] = {
            id: id,
            resolver: Promise.defer(),
            options: options,
            error: error
          };

          // remove this task from the queue. It is already rejected (hence this
          // catch event), and else it will be rejected again when terminating
          delete me.processing[id];
          me.tracking[id].resolver.promise = me.tracking[id].resolver.promise.catch(function (err) {
            delete me.tracking[id];

            // if we find the error is an instance of WrappedTimeoutError we know the error should not cause termination
            // as the response from the worker did not contain an error. We still wish to throw the original timeout error
            // to the caller.
            if (err instanceof WrappedTimeoutError) {
              throw err.error;
            }
            var promise = me.terminateAndNotify(true).then(function () {
              throw err;
            }, function (err) {
              throw err;
            });
            return promise;
          });
          me.worker.send({
            id: id,
            method: CLEANUP_METHOD_ID
          });

          /**
            * Sets a timeout to reject the cleanup operation if the message sent to the worker
            * does not receive a response. see worker.tryCleanup for worker cleanup operations.
            * Here we use the workerTerminateTimeout as the worker will be terminated if the timeout does invoke.
            * 
            * We need this timeout in either case of a Timeout or Cancellation Error as if
            * the worker does not send a message we still need to give a window of time for a response.
            * 
            * The workerTermniateTimeout is used here if this promise is rejected the worker cleanup
            * operations will occure.
          */
          me.tracking[id].timeoutId = setTimeout(function () {
            me.tracking[id].resolver.reject(error);
          }, me.workerTerminateTimeout);
          return me.tracking[id].resolver.promise;
        } else {
          throw error;
        }
      });
    };

    /**
     * Test whether the worker is processing any tasks or cleaning up before termination.
     * @return {boolean} Returns true if the worker is busy
     */
    WorkerHandler$1.prototype.busy = function () {
      return this.cleaning || Object.keys(this.processing).length > 0;
    };

    /**
     * Terminate the worker.
     * @param {boolean} [force=false]   If false (default), the worker is terminated
     *                                  after finishing all tasks currently in
     *                                  progress. If true, the worker will be
     *                                  terminated immediately.
     * @param {function} [callback=null] If provided, will be called when process terminates.
     */
    WorkerHandler$1.prototype.terminate = function (force, callback) {
      var me = this;
      if (force) {
        // cancel all tasks in progress
        for (var id in this.processing) {
          if (this.processing[id] !== undefined) {
            this.processing[id].resolver.reject(new Error('Worker terminated'));
          }
        }
        this.processing = Object.create(null);
      }

      // If we are terminating, cancel all tracked task for cleanup
      for (var _i = 0, _Object$values = Object.values(me.tracking); _i < _Object$values.length; _i++) {
        var task = _Object$values[_i];
        clearTimeout(task.timeoutId);
        task.resolver.reject(new Error('Worker Terminating'));
      }
      me.tracking = Object.create(null);
      if (typeof callback === 'function') {
        this.terminationHandler = callback;
      }
      if (!this.busy()) {
        // all tasks are finished. kill the worker
        var cleanup = function cleanup(err) {
          me.terminated = true;
          me.cleaning = false;
          if (me.worker != null && me.worker.removeAllListeners) {
            // removeAllListeners is only available for child_process
            me.worker.removeAllListeners('message');
          }
          me.worker = null;
          me.terminating = false;
          if (me.terminationHandler) {
            me.terminationHandler(err, me);
          } else if (err) {
            throw err;
          }
        };
        if (this.worker) {
          if (typeof this.worker.kill === 'function') {
            if (this.worker.killed) {
              cleanup(new Error('worker already killed!'));
              return;
            }

            // child process and worker threads
            var cleanExitTimeout = setTimeout(function () {
              if (me.worker) {
                me.worker.kill();
              }
            }, this.workerTerminateTimeout);
            this.worker.once('exit', function () {
              clearTimeout(cleanExitTimeout);
              if (me.worker) {
                me.worker.killed = true;
              }
              cleanup();
            });
            if (this.worker.ready) {
              this.worker.send(TERMINATE_METHOD_ID);
            } else {
              this.requestQueue.push({
                message: TERMINATE_METHOD_ID
              });
            }

            // mark that the worker is cleaning up resources
            // to prevent new tasks from being executed
            this.cleaning = true;
            return;
          } else if (typeof this.worker.terminate === 'function') {
            this.worker.terminate(); // web worker
            this.worker.killed = true;
          } else {
            throw new Error('Failed to terminate worker');
          }
        }
        cleanup();
      } else {
        // we can't terminate immediately, there are still tasks being executed
        this.terminating = true;
      }
    };

    /**
     * Terminate the worker, returning a Promise that resolves when the termination has been done.
     * @param {boolean} [force=false]   If false (default), the worker is terminated
     *                                  after finishing all tasks currently in
     *                                  progress. If true, the worker will be
     *                                  terminated immediately.
     * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
     *                                  after timeout if worker process has not been terminated.
     * @return {Promise.<WorkerHandler, Error>}
     */
    WorkerHandler$1.prototype.terminateAndNotify = function (force, timeout) {
      var resolver = Promise.defer();
      if (timeout) {
        resolver.promise.timeout(timeout);
      }
      this.terminate(force, function (err, worker) {
        if (err) {
          resolver.reject(err);
        } else {
          resolver.resolve(worker);
        }
      });
      return resolver.promise;
    };

    /**
    * Wrapper error type to denote that a TimeoutError has already been proceesed
    * and we should skip cleanup operations
    * @param {Promise.TimeoutError} timeoutError
    */
    function WrappedTimeoutError(timeoutError) {
      this.error = timeoutError;
      this.stack = new Error().stack;
    }
    WorkerHandler.exports = WorkerHandler$1;
    WorkerHandler.exports._tryRequireWorkerThreads = tryRequireWorkerThreads;
    WorkerHandler.exports._setupProcessWorker = setupProcessWorker;
    WorkerHandler.exports._setupBrowserWorker = setupBrowserWorker;
    WorkerHandler.exports._setupWorkerThreadWorker = setupWorkerThreadWorker;
    WorkerHandler.exports.ensureWorkerThreads = ensureWorkerThreads;
    return WorkerHandler.exports;
  }

  var debugPortAllocator;
  var hasRequiredDebugPortAllocator;
  function requireDebugPortAllocator() {
    if (hasRequiredDebugPortAllocator) return debugPortAllocator;
    hasRequiredDebugPortAllocator = 1;
    var MAX_PORTS = 65535;
    debugPortAllocator = DebugPortAllocator;
    function DebugPortAllocator() {
      this.ports = Object.create(null);
      this.length = 0;
    }
    DebugPortAllocator.prototype.nextAvailableStartingAt = function (starting) {
      while (this.ports[starting] === true) {
        starting++;
      }
      if (starting >= MAX_PORTS) {
        throw new Error('WorkerPool debug port limit reached: ' + starting + '>= ' + MAX_PORTS);
      }
      this.ports[starting] = true;
      this.length++;
      return starting;
    };
    DebugPortAllocator.prototype.releasePort = function (port) {
      delete this.ports[port];
      this.length--;
    };
    return debugPortAllocator;
  }

  var Pool_1;
  var hasRequiredPool;
  function requirePool() {
    if (hasRequiredPool) return Pool_1;
    hasRequiredPool = 1;
    var _require$$ = require_Promise(),
      Promise = _require$$.Promise;
    var WorkerHandler = requireWorkerHandler();
    var environment = environmentExports;
    var DebugPortAllocator = requireDebugPortAllocator();
    var DEBUG_PORT_ALLOCATOR = new DebugPortAllocator();
    /**
     * A pool to manage workers, which can be created using the function workerpool.pool.
     *
     * @param {String} [script]   Optional worker script
     * @param {import('./types.js').WorkerPoolOptions} [options]  See docs
     * @constructor
     */
    function Pool(script, options) {
      if (typeof script === 'string') {
        /** @readonly */
        this.script = script || null;
      } else {
        this.script = null;
        options = script;
      }

      /** @private */
      this.workers = []; // queue with all workers
      /** @private */
      this.tasks = []; // queue with tasks awaiting execution

      options = options || {};

      /** @readonly */
      this.forkArgs = Object.freeze(options.forkArgs || []);
      /** @readonly */
      this.forkOpts = Object.freeze(options.forkOpts || {});
      /** @readonly */
      this.workerOpts = Object.freeze(options.workerOpts || {});
      /** @readonly */
      this.workerThreadOpts = Object.freeze(options.workerThreadOpts || {});
      /** @private */
      this.debugPortStart = options.debugPortStart || 43210;
      /** @readonly @deprecated */
      this.nodeWorker = options.nodeWorker;
      /** @readonly
       * @type {'auto' | 'web' | 'process' | 'thread'}
       */
      this.workerType = options.workerType || options.nodeWorker || 'auto';
      /** @readonly */
      this.maxQueueSize = options.maxQueueSize || Infinity;
      /** @readonly */
      this.workerTerminateTimeout = options.workerTerminateTimeout || 1000;

      /** @readonly */
      this.onCreateWorker = options.onCreateWorker || function () {
        return null;
      };
      /** @readonly */
      this.onTerminateWorker = options.onTerminateWorker || function () {
        return null;
      };

      /** @readonly */
      this.emitStdStreams = options.emitStdStreams || false;

      // configuration
      if (options && 'maxWorkers' in options) {
        validateMaxWorkers(options.maxWorkers);
        /** @readonly */
        this.maxWorkers = options.maxWorkers;
      } else {
        this.maxWorkers = Math.max((environment.cpus || 4) - 1, 1);
      }
      if (options && 'minWorkers' in options) {
        if (options.minWorkers === 'max') {
          /** @readonly */
          this.minWorkers = this.maxWorkers;
        } else {
          validateMinWorkers(options.minWorkers);
          this.minWorkers = options.minWorkers;
          this.maxWorkers = Math.max(this.minWorkers, this.maxWorkers); // in case minWorkers is higher than maxWorkers
        }
        this._ensureMinWorkers();
      }

      /** @private */
      this._boundNext = this._next.bind(this);
      if (this.workerType === 'thread') {
        WorkerHandler.ensureWorkerThreads();
      }
    }

    /**
     * Execute a function on a worker.
     *
     * Example usage:
     *
     *   var pool = new Pool()
     *
     *   // call a function available on the worker
     *   pool.exec('fibonacci', [6])
     *
     *   // offload a function
     *   function add(a, b) {
     *     return a + b
     *   };
     *   pool.exec(add, [2, 4])
     *       .then(function (result) {
     *         console.log(result); // outputs 6
     *       })
     *       .catch(function(error) {
     *         console.log(error);
     *       });
     * @template { (...args: any[]) => any } T
     * @param {String | T} method  Function name or function.
     *                                    If `method` is a string, the corresponding
     *                                    method on the worker will be executed
     *                                    If `method` is a Function, the function
     *                                    will be stringified and executed via the
     *                                    workers built-in function `run(fn, args)`.
     * @param {Parameters<T> | null} [params]  Function arguments applied when calling the function
     * @param {import('./types.js').ExecOptions} [options]  Options
     * @return {Promise<ReturnType<T>>}
     */
    Pool.prototype.exec = function (method, params, options) {
      // validate type of arguments
      if (params && !Array.isArray(params)) {
        throw new TypeError('Array expected as argument "params"');
      }
      if (typeof method === 'string') {
        var resolver = Promise.defer();
        if (this.tasks.length >= this.maxQueueSize) {
          throw new Error('Max queue size of ' + this.maxQueueSize + ' reached');
        }

        // add a new task to the queue
        var tasks = this.tasks;
        var task = {
          method: method,
          params: params,
          resolver: resolver,
          timeout: null,
          options: options
        };
        tasks.push(task);

        // replace the timeout method of the Promise with our own,
        // which starts the timer as soon as the task is actually started
        var originalTimeout = resolver.promise.timeout;
        resolver.promise.timeout = function timeout(delay) {
          if (tasks.indexOf(task) !== -1) {
            // task is still queued -> start the timer later on
            task.timeout = delay;
            return resolver.promise;
          } else {
            // task is already being executed -> start timer immediately
            return originalTimeout.call(resolver.promise, delay);
          }
        };

        // trigger task execution
        this._next();
        return resolver.promise;
      } else if (typeof method === 'function') {
        // send stringified function and function arguments to worker
        return this.exec('run', [String(method), params], options);
      } else {
        throw new TypeError('Function or string expected as argument "method"');
      }
    };

    /**
     * Create a proxy for current worker. Returns an object containing all
     * methods available on the worker. All methods return promises resolving the methods result.
     * @template { { [k: string]: (...args: any[]) => any } } T
     * @return {Promise<import('./types.js').Proxy<T>, Error>} Returns a promise which resolves with a proxy object
     */
    Pool.prototype.proxy = function () {
      if (arguments.length > 0) {
        throw new Error('No arguments expected');
      }
      var pool = this;
      return this.exec('methods').then(function (methods) {
        var proxy = {};
        methods.forEach(function (method) {
          proxy[method] = function () {
            return pool.exec(method, Array.prototype.slice.call(arguments));
          };
        });
        return proxy;
      });
    };

    /**
     * Creates new array with the results of calling a provided callback function
     * on every element in this array.
     * @param {Array} array
     * @param {function} callback  Function taking two arguments:
     *                             `callback(currentValue, index)`
     * @return {Promise.<Array>} Returns a promise which resolves  with an Array
     *                           containing the results of the callback function
     *                           executed for each of the array elements.
     */
    /* TODO: implement map
    Pool.prototype.map = function (array, callback) {
    };
    */

    /**
     * Grab the first task from the queue, find a free worker, and assign the
     * worker to the task.
     * @private
     */
    Pool.prototype._next = function () {
      if (this.tasks.length > 0) {
        // there are tasks in the queue

        // find an available worker
        var worker = this._getWorker();
        if (worker) {
          // get the first task from the queue
          var me = this;
          var task = this.tasks.shift();

          // check if the task is still pending (and not cancelled -> promise rejected)
          if (task.resolver.promise.pending) {
            // send the request to the worker
            var promise = worker.exec(task.method, task.params, task.resolver, task.options).then(me._boundNext).catch(function () {
              // if the worker crashed and terminated, remove it from the pool
              if (worker.terminated) {
                return me._removeWorker(worker);
              }
            }).then(function () {
              me._next(); // trigger next task in the queue
            });

            // start queued timer now
            if (typeof task.timeout === 'number') {
              promise.timeout(task.timeout);
            }
          } else {
            // The task taken was already complete (either rejected or resolved), so just trigger next task in the queue
            me._next();
          }
        }
      }
    };

    /**
     * Get an available worker. If no worker is available and the maximum number
     * of workers isn't yet reached, a new worker will be created and returned.
     * If no worker is available and the maximum number of workers is reached,
     * null will be returned.
     *
     * @return {WorkerHandler | null} worker
     * @private
     */
    Pool.prototype._getWorker = function () {
      // find a non-busy worker
      var workers = this.workers;
      for (var i = 0; i < workers.length; i++) {
        var worker = workers[i];
        if (worker.busy() === false) {
          return worker;
        }
      }
      if (workers.length < this.maxWorkers) {
        // create a new worker
        worker = this._createWorkerHandler();
        workers.push(worker);
        return worker;
      }
      return null;
    };

    /**
     * Remove a worker from the pool.
     * Attempts to terminate worker if not already terminated, and ensures the minimum
     * pool size is met.
     * @param {WorkerHandler} worker
     * @return {Promise<WorkerHandler>}
     * @private
     */
    Pool.prototype._removeWorker = function (worker) {
      var me = this;
      DEBUG_PORT_ALLOCATOR.releasePort(worker.debugPort);
      // _removeWorker will call this, but we need it to be removed synchronously
      this._removeWorkerFromList(worker);
      // If minWorkers set, spin up new workers to replace the crashed ones
      this._ensureMinWorkers();
      // terminate the worker (if not already terminated)
      return new Promise(function (resolve, reject) {
        worker.terminate(false, function (err) {
          me.onTerminateWorker({
            forkArgs: worker.forkArgs,
            forkOpts: worker.forkOpts,
            workerThreadOpts: worker.workerThreadOpts,
            script: worker.script
          });
          if (err) {
            reject(err);
          } else {
            resolve(worker);
          }
        });
      });
    };

    /**
     * Remove a worker from the pool list.
     * @param {WorkerHandler} worker
     * @private
     */
    Pool.prototype._removeWorkerFromList = function (worker) {
      // remove from the list with workers
      var index = this.workers.indexOf(worker);
      if (index !== -1) {
        this.workers.splice(index, 1);
      }
    };

    /**
     * Close all active workers. Tasks currently being executed will be finished first.
     * @param {boolean} [force=false]   If false (default), the workers are terminated
     *                                  after finishing all tasks currently in
     *                                  progress. If true, the workers will be
     *                                  terminated immediately.
     * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
     *                                  after timeout if worker process has not been terminated.
     * @return {Promise.<void, Error>}
     */
    Pool.prototype.terminate = function (force, timeout) {
      var me = this;

      // cancel any pending tasks
      this.tasks.forEach(function (task) {
        task.resolver.reject(new Error('Pool terminated'));
      });
      this.tasks.length = 0;
      var f = function f(worker) {
        DEBUG_PORT_ALLOCATOR.releasePort(worker.debugPort);
        this._removeWorkerFromList(worker);
      };
      var removeWorker = f.bind(this);
      var promises = [];
      var workers = this.workers.slice();
      workers.forEach(function (worker) {
        var termPromise = worker.terminateAndNotify(force, timeout).then(removeWorker).always(function () {
          me.onTerminateWorker({
            forkArgs: worker.forkArgs,
            forkOpts: worker.forkOpts,
            workerThreadOpts: worker.workerThreadOpts,
            script: worker.script
          });
        });
        promises.push(termPromise);
      });
      return Promise.all(promises);
    };

    /**
     * Retrieve statistics on tasks and workers.
     * @return {{totalWorkers: number, busyWorkers: number, idleWorkers: number, pendingTasks: number, activeTasks: number}} Returns an object with statistics
     */
    Pool.prototype.stats = function () {
      var totalWorkers = this.workers.length;
      var busyWorkers = this.workers.filter(function (worker) {
        return worker.busy();
      }).length;
      return {
        totalWorkers: totalWorkers,
        busyWorkers: busyWorkers,
        idleWorkers: totalWorkers - busyWorkers,
        pendingTasks: this.tasks.length,
        activeTasks: busyWorkers
      };
    };

    /**
     * Ensures that a minimum of minWorkers is up and running
     * @private
     */
    Pool.prototype._ensureMinWorkers = function () {
      if (this.minWorkers) {
        for (var i = this.workers.length; i < this.minWorkers; i++) {
          this.workers.push(this._createWorkerHandler());
        }
      }
    };

    /**
     * Helper function to create a new WorkerHandler and pass all options.
     * @return {WorkerHandler}
     * @private
     */
    Pool.prototype._createWorkerHandler = function () {
      var overriddenParams = this.onCreateWorker({
        forkArgs: this.forkArgs,
        forkOpts: this.forkOpts,
        workerOpts: this.workerOpts,
        workerThreadOpts: this.workerThreadOpts,
        script: this.script
      }) || {};
      return new WorkerHandler(overriddenParams.script || this.script, {
        forkArgs: overriddenParams.forkArgs || this.forkArgs,
        forkOpts: overriddenParams.forkOpts || this.forkOpts,
        workerOpts: overriddenParams.workerOpts || this.workerOpts,
        workerThreadOpts: overriddenParams.workerThreadOpts || this.workerThreadOpts,
        debugPort: DEBUG_PORT_ALLOCATOR.nextAvailableStartingAt(this.debugPortStart),
        workerType: this.workerType,
        workerTerminateTimeout: this.workerTerminateTimeout,
        emitStdStreams: this.emitStdStreams
      });
    };

    /**
     * Ensure that the maxWorkers option is an integer >= 1
     * @param {*} maxWorkers
     * @returns {boolean} returns true maxWorkers has a valid value
     */
    function validateMaxWorkers(maxWorkers) {
      if (!isNumber(maxWorkers) || !isInteger(maxWorkers) || maxWorkers < 1) {
        throw new TypeError('Option maxWorkers must be an integer number >= 1');
      }
    }

    /**
     * Ensure that the minWorkers option is an integer >= 0
     * @param {*} minWorkers
     * @returns {boolean} returns true when minWorkers has a valid value
     */
    function validateMinWorkers(minWorkers) {
      if (!isNumber(minWorkers) || !isInteger(minWorkers) || minWorkers < 0) {
        throw new TypeError('Option minWorkers must be an integer number >= 0');
      }
    }

    /**
     * Test whether a variable is a number
     * @param {*} value
     * @returns {boolean} returns true when value is a number
     */
    function isNumber(value) {
      return typeof value === 'number';
    }

    /**
     * Test whether a number is an integer
     * @param {number} value
     * @returns {boolean} Returns true if value is an integer
     */
    function isInteger(value) {
      return Math.round(value) == value;
    }
    Pool_1 = Pool;
    return Pool_1;
  }

  var worker$1 = {};

  /**
   * The helper class for transferring data from the worker to the main thread.
   *
   * @param {Object} message The object to deliver to the main thread.
   * @param {Object[]} transfer An array of transferable Objects to transfer ownership of.
   */
  var transfer;
  var hasRequiredTransfer;
  function requireTransfer() {
    if (hasRequiredTransfer) return transfer;
    hasRequiredTransfer = 1;
    function Transfer(message, transfer) {
      this.message = message;
      this.transfer = transfer;
    }
    transfer = Transfer;
    return transfer;
  }

  var hasRequiredWorker;
  function requireWorker() {
    if (hasRequiredWorker) return worker$1;
    hasRequiredWorker = 1;
    (function (exports) {
      var Transfer = requireTransfer();

      /**
       * worker must handle async cleanup handlers. Use custom Promise implementation. 
      */
      var Promise = require_Promise().Promise;
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
    return worker$1;
  }

  var platform = environmentExports.platform,
    isMainThread = environmentExports.isMainThread,
    cpus = environmentExports.cpus;

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
    var Pool = requirePool();
    return new Pool(script, options);
  }
  var pool_1 = src.pool = pool;

  /**
   * Create a worker and optionally register a set of methods to the worker.
   * @param {{ [k: string]: (...args: any[]) => any }} [methods]
   * @param {WorkerRegisterOptions} [options]
   */
  function worker(methods, options) {
    var worker = requireWorker();
    worker.add(methods, options);
  }
  var worker_1 = src.worker = worker;

  /**
   * Sends an event to the parent worker pool.
   * @param {any} payload 
   */
  function workerEmit(payload) {
    var worker = requireWorker();
    worker.emit(payload);
  }
  var workerEmit_1 = src.workerEmit = workerEmit;
  var _require$$ = require_Promise(),
    Promise$1 = _require$$.Promise;
  var _Promise = src.Promise = Promise$1;
  var Transfer = src.Transfer = requireTransfer();
  var platform_1 = src.platform = platform;
  var isMainThread_1 = src.isMainThread = isMainThread;
  var cpus_1 = src.cpus = cpus;

  exports.Promise = _Promise;
  exports.Transfer = Transfer;
  exports.cpus = cpus_1;
  exports.default = src;
  exports.isMainThread = isMainThread_1;
  exports.platform = platform_1;
  exports.pool = pool_1;
  exports.worker = worker_1;
  exports.workerEmit = workerEmit_1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=workerpool.js.map
