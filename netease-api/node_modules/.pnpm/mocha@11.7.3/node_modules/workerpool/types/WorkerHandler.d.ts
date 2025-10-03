export = WorkerHandler;
/**
 * A WorkerHandler controls a single worker. This worker can be a child process
 * on node.js or a WebWorker in a browser environment.
 * @param {String} [script] If no script is provided, a default worker with a
 *                          function run will be created.
 * @param {import('./types.js').WorkerPoolOptions} [_options] See docs
 * @constructor
 */
declare function WorkerHandler(script?: string, _options?: import("./types.js").WorkerPoolOptions): void;
declare class WorkerHandler {
    /**
     * A WorkerHandler controls a single worker. This worker can be a child process
     * on node.js or a WebWorker in a browser environment.
     * @param {String} [script] If no script is provided, a default worker with a
     *                          function run will be created.
     * @param {import('./types.js').WorkerPoolOptions} [_options] See docs
     * @constructor
     */
    constructor(script?: string, _options?: import("./types.js").WorkerPoolOptions);
    script: any;
    worker: any;
    debugPort: any;
    forkOpts: import("child_process").ForkOptions | undefined;
    forkArgs: string[] | undefined;
    workerOpts: WorkerOptions | undefined;
    workerThreadOpts: import("worker_threads").WorkerOptions | undefined;
    workerTerminateTimeout: number | undefined;
    requestQueue: any[];
    processing: any;
    tracking: any;
    terminating: boolean;
    terminated: boolean;
    cleaning: boolean;
    terminationHandler: Function | null;
    lastId: number;
    /**
     * Get a list with methods available on the worker.
     * @return {Promise.<String[], Error>} methods
     */
    methods(): Promise<string[], Error>;
    /**
     * Execute a method with given parameters on the worker
     * @param {String} method
     * @param {Array} [params]
     * @param {{resolve: Function, reject: Function}} [resolver]
     * @param {import('./types.js').ExecOptions}  [options]
     * @return {Promise.<*, Error>} result
     */
    exec(method: string, params?: any[], resolver?: {
        resolve: Function;
        reject: Function;
    }, options?: import("./types.js").ExecOptions): Promise<any, Error>;
    /**
     * Test whether the worker is processing any tasks or cleaning up before termination.
     * @return {boolean} Returns true if the worker is busy
     */
    busy(): boolean;
    /**
     * Terminate the worker.
     * @param {boolean} [force=false]   If false (default), the worker is terminated
     *                                  after finishing all tasks currently in
     *                                  progress. If true, the worker will be
     *                                  terminated immediately.
     * @param {function} [callback=null] If provided, will be called when process terminates.
     */
    terminate(force?: boolean, callback?: Function): void;
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
    terminateAndNotify(force?: boolean, timeout?: number): Promise<WorkerHandler, Error>;
}
declare namespace WorkerHandler {
    export { tryRequireWorkerThreads as _tryRequireWorkerThreads, setupProcessWorker as _setupProcessWorker, setupBrowserWorker as _setupBrowserWorker, setupWorkerThreadWorker as _setupWorkerThreadWorker, ensureWorkerThreads };
}
import { Promise } from "./Promise";
declare function tryRequireWorkerThreads(): typeof import("worker_threads") | null;
declare function setupProcessWorker(script: any, options: any, child_process: any): any;
declare function setupBrowserWorker(script: any, workerOpts: any, Worker: any): any;
declare function setupWorkerThreadWorker(script: any, WorkerThreads: any, options: any): any;
declare function ensureWorkerThreads(): typeof import("worker_threads");
