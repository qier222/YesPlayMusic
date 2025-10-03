/**
 * worker must be started as a child process or a web worker.
 * It listens for RPC messages from the parent process.
 */

var Transfer = require('./transfer');

/**
 * worker must handle async cleanup handlers. Use custom Promise implementation. 
*/
var Promise = require('./Promise').Promise;
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


var TIMEOUT_DEFAULT = 1_000;

// create a worker API for sending and receiving messages which works both on
// node.js and in the browser
var worker = {
  exit: function() {}
};

// api for in worker communication with parent process
// works in both node.js and the browser
var publicWorker = {
  /**
   * Registers listeners which will trigger when a task is timed out or cancled. If all listeners resolve, the worker executing the given task will not be terminated.
   * *Note*: If there is a blocking operation within a listener, the worker will be terminated.
   * @param {() => Promise<void>} listener
  */
  addAbortListener: function(listener) {
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
    })
  };
  worker.send = function (message, transfer) {
     transfer ? postMessage(message, transfer) : postMessage (message);
  };
}
else if (typeof process !== 'undefined') {
  // node.js

  var WorkerThreads;
  try {
    WorkerThreads = require('worker_threads');
  } catch(error) {
    if (typeof error === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND') {
      // no worker_threads, fallback to sub-process based workers
    } else {
      throw error;
    }
  }

  if (WorkerThreads &&
    /* if there is a parentPort, we are in a WorkerThread */
    WorkerThreads.parentPort !== null) {
    var parentPort  = WorkerThreads.parentPort;
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
}
else {
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
  return value && (typeof value.then === 'function') && (typeof value.catch === 'function');
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
worker.terminateAndExit = function(code) {
  var _exit = function() {
    worker.exit(code);
  }

  if(!worker.terminationHandler) {
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
}



/**
  * Called within the worker message handler to run abort handlers if registered to perform cleanup operations.
  * @param {Integer} [requestId] id of task which is currently executing in the worker
  * @return {Promise<void>}
*/
worker.cleanup = function(requestId) {

  if (!worker.abortListeners.length) {
    worker.send({
      id: requestId,
      method: CLEANUP_METHOD_ID,
      error: convertError(new Error('Worker terminating')),
    });

    // If there are no handlers registered, reject the promise with an error as we want the handler to be notified
    // that cleanup should begin and the handler should be GCed.
    return new Promise(function(resolve) { resolve(); });
  }
  

  var _exit = function() {
    worker.exit();
  }

  var _abort = function() {
    if (!worker.abortListeners.length) {
      worker.abortListeners = [];
    }
  }

  const promises = worker.abortListeners.map(listener => listener());
  let timerId;
  const timeoutPromise = new Promise((_resolve, reject) => {
    timerId = setTimeout(function () { 
      reject(new Error('Timeout occured waiting for abort handler, killing worker'));
    }, worker.abortListenerTimeout);
  });

  // Once a promise settles we need to clear the timeout to prevet fulfulling the promise twice 
  const settlePromise = Promise.all(promises).then(function() {
    clearTimeout(timerId);
    _abort();
  }, function() {
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
  return new Promise(function(resolve, reject) {
    settlePromise.then(resolve, reject);
    timeoutPromise.then(resolve, reject);
  }).then(function() {
    worker.send({
      id: requestId,
      method: CLEANUP_METHOD_ID,
      error: null,
    });
  }, function(err) {
    worker.send({
      id: requestId,
      method: CLEANUP_METHOD_ID,
      error: err ? convertError(err) : null,
    });
  });
}

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
        result
            .then(function (result) {
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
            })
            .catch(function (err) {
              worker.send({
                id: request.id,
                result: null,
                error: convertError(err),
              });
              currentRequestId = null;
            });
      }
      else {
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
    }
    else {
      throw new Error('Unknown method "' + request.method + '"');
    }
  }
  catch (err) {
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
      payload
    });
  }
};


if (typeof exports !== 'undefined') {
  exports.add = worker.register;
  exports.emit = worker.emit;
}
