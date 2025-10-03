export = Pool;
/**
 * A pool to manage workers, which can be created using the function workerpool.pool.
 *
 * @param {String} [script]   Optional worker script
 * @param {import('./types.js').WorkerPoolOptions} [options]  See docs
 * @constructor
 */
declare function Pool(script?: string, options?: import("./types.js").WorkerPoolOptions): void;
declare class Pool {
    /**
     * A pool to manage workers, which can be created using the function workerpool.pool.
     *
     * @param {String} [script]   Optional worker script
     * @param {import('./types.js').WorkerPoolOptions} [options]  See docs
     * @constructor
     */
    constructor(script?: string, options?: import("./types.js").WorkerPoolOptions);
    /** @readonly */
    readonly script: string | null;
    /** @private */
    private workers;
    /** @private */
    private tasks;
    /** @readonly */
    readonly forkArgs: readonly string[];
    /** @readonly */
    readonly forkOpts: Readonly<import("child_process").ForkOptions>;
    /** @readonly */
    readonly workerOpts: Readonly<WorkerOptions>;
    /** @readonly */
    readonly workerThreadOpts: Readonly<import("worker_threads").WorkerOptions>;
    /** @private */
    private debugPortStart;
    /** @readonly @deprecated */
    readonly nodeWorker: any;
    /** @readonly
     * @type {'auto' | 'web' | 'process' | 'thread'}
     */
    readonly workerType: "auto" | "web" | "process" | "thread";
    /** @readonly */
    readonly maxQueueSize: number;
    /** @readonly */
    readonly workerTerminateTimeout: number;
    /** @readonly */
    readonly onCreateWorker: ((arg: import("./types.js").WorkerArg) => import("./types.js").WorkerArg | undefined) | (() => null);
    /** @readonly */
    readonly onTerminateWorker: (arg: import("./types.js").WorkerArg) => void;
    /** @readonly */
    readonly emitStdStreams: boolean;
    /** @readonly */
    readonly maxWorkers: number | undefined;
    /** @readonly */
    readonly minWorkers: number | undefined;
    /** @private */
    private _boundNext;
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
    exec<T extends (...args: any[]) => any>(method: string | T, params?: Parameters<T> | null, options?: import("./types.js").ExecOptions): Promise<ReturnType<T>>;
    /**
     * Create a proxy for current worker. Returns an object containing all
     * methods available on the worker. All methods return promises resolving the methods result.
     * @template { { [k: string]: (...args: any[]) => any } } T
     * @return {Promise<import('./types.js').Proxy<T>, Error>} Returns a promise which resolves with a proxy object
     */
    proxy<T extends {
        [k: string]: (...args: any[]) => any;
    }>(...args: any[]): Promise<import("./types.js").Proxy<T>, Error>;
    private _next;
    private _getWorker;
    private _removeWorker;
    private _removeWorkerFromList;
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
    terminate(force?: boolean, timeout?: number): Promise<void, Error>;
    /**
     * Retrieve statistics on tasks and workers.
     * @return {{totalWorkers: number, busyWorkers: number, idleWorkers: number, pendingTasks: number, activeTasks: number}} Returns an object with statistics
     */
    stats(): {
        totalWorkers: number;
        busyWorkers: number;
        idleWorkers: number;
        pendingTasks: number;
        activeTasks: number;
    };
    private _ensureMinWorkers;
    private _createWorkerHandler;
}
import { Promise } from "./Promise";
