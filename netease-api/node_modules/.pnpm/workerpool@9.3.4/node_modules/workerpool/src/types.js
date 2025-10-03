/**
 * @typedef {Object} WorkerArg
 * @property {string[]} [forkArgs] The `forkArgs` option of this pool
 * @property {import('child_process').ForkOptions} [forkOpts] The `forkOpts` option of this pool
 * @property {WorkerOptions} [workerOpts] The `workerOpts` option of this pool
 * @property {import('worker_threads').WorkerOptions} [workerThreadOpts] The `workerThreadOpts` option of this pool
 * @property {string} [script] The `script` option of this pool
 */

/**
 * @typedef {Object} WorkerPoolOptions
 * @property {number | 'max'} [minWorkers] The minimum number of workers that must be initialized and kept available. Setting this to `'max'` will create `maxWorkers` default workers
 * @property {number} [maxWorkers]  The default number of maxWorkers is the number of CPU's minus one. When the number of CPU's could not be determined (for example in older browsers), `maxWorkers` is set to 3.
 * @property {number} [maxQueueSize] The maximum number of tasks allowed to be queued. Can be used to prevent running out of memory. If the maximum is exceeded, adding a new task will throw an error. The default value is `Infinity`.
 * @property {'auto' | 'web' | 'process' | 'thread'} [workerType]
 *   - In case of `'auto'` (default), workerpool will automatically pick a suitable type of worker: when in a browser environment, `'web'` will be used. When in a node.js environment, `worker_threads` will be used if available (Node.js >= 11.7.0), else `child_process` will be used.
 *   - In case of `'web'`, a Web Worker will be used. Only available in a browser environment.
 *   - In case of `'process'`, `child_process` will be used. Only available in a node.js environment.
 *   - In case of `'thread'`, `worker_threads` will be used. If `worker_threads` are not available, an error is thrown. Only available in a node.js environment.
 * @property {number} [workerTerminateTimeout] The timeout in milliseconds to wait for a worker to clean up it's resources on termination before stopping it forcefully. Default value is `1000`.
 * @property {string[]} [forkArgs] For `process` worker type. An array passed as `args` to [child_process.fork](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options)
 * @property {import('child_process').ForkOptions} [forkOpts] For `process` worker type. An object passed as `options` to [child_process.fork](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options).
 * @property {WorkerOptions} [workerOpts] For `web` worker type. An object passed to the [constructor of the web worker](https://html.spec.whatwg.org/multipage/workers.html#dom-worker). See [WorkerOptions specification](https://html.spec.whatwg.org/multipage/workers.html#workeroptions) for available options.
 * @property {import('worker_threads').WorkerOptions} [workerThreadOpts] Object`. For `worker` worker type. An object passed to [worker_threads.options](https://nodejs.org/api/worker_threads.html#new-workerfilename-options).
 * @property {boolean} [emitStdStreams] Capture stdout and stderr from the worker and emit them via the `stdout` and `stderr` events. Not supported by the `web` worker type.
 * @property { (arg: WorkerArg) => WorkerArg | undefined } [onCreateWorker] A callback that is called whenever a worker is being created. It can be used to allocate resources for each worker for example. Optionally, this callback can return an object containing one or more of the `WorkerArg` properties. The provided properties will be used to override the Pool properties for the worker being created.
 * @property { (arg: WorkerArg) => void } [onTerminateWorker] A callback that is called whenever a worker is being terminated. It can be used to release resources that might have been allocated for this specific worker. The callback is passed as argument an object as described for `onCreateWorker`, with each property sets with the value for the worker being terminated.
 */

/**
 * @typedef {Object} ExecOptions
 * @property {(payload: any) => unknown} [on] An event listener, to handle events sent by the worker for this execution.
 * @property {Object[]} [transfer] A list of transferable objects to send to the worker. Not supported by `process` worker type. See ./examples/transferableObjects.js for usage.
 */

/**
 * @typedef {Object} WorkerRegisterOptions
 * @property {(code: number | undefined) => PromiseLike<void> | void} [onTerminate] A callback that is called whenever a worker is being terminated. It can be used to release resources that might have been allocated for this specific worker. The difference with pool's `onTerminateWorker` is that this callback runs in the worker context, while onTerminateWorker is executed on the main thread.
  * @property {number} [abortListenerTimeout] The timeout in milliseconds to wait for a worker to clean up it's resources if an abort listener does not resolve, before stopping the worker forcefully. Default value is `1000`.
 */

/**
 * @template { { [k: string]: (...args: any[]) => any } } T
 * @typedef {{ [M in keyof T]: (...args: Parameters<T[M]>) => import('./Promise.js').Promise<ReturnType<T[M]>>; }} Proxy<T>
 */

module.exports = {}
