export const Transfer: typeof import("./transfer");
export type Pool = import("./Pool");
export type WorkerPoolOptions = import("./types.js").WorkerPoolOptions;
export type WorkerRegisterOptions = import("./types.js").WorkerRegisterOptions;
/**
 * <T>
 */
export type Proxy<T extends {
    [k: string]: (...args: any[]) => any;
}> = import("./types.js").Proxy<T>;
/**
 * @overload
 * Create a new worker pool
 * @param {WorkerPoolOptions} [script]
 * @returns {Pool} pool
 */
export function pool(script?: import("./types.js").WorkerPoolOptions | undefined): import("./Pool");
/**
 * @overload
 * Create a new worker pool
 * @param {string} [script]
 * @param {WorkerPoolOptions} [options]
 * @returns {Pool} pool
 */
export function pool(script?: string | undefined, options?: import("./types.js").WorkerPoolOptions | undefined): import("./Pool");
/**
 * Create a worker and optionally register a set of methods to the worker.
 * @param {{ [k: string]: (...args: any[]) => any }} [methods]
 * @param {WorkerRegisterOptions} [options]
 */
export function worker(methods?: {
    [k: string]: (...args: any[]) => any;
}, options?: WorkerRegisterOptions): void;
/**
 * Sends an event to the parent worker pool.
 * @param {any} payload
 */
export function workerEmit(payload: any): void;
import { Promise } from "./Promise";
import { platform } from "./environment";
import { isMainThread } from "./environment";
import { cpus } from "./environment";
export { Promise, platform, isMainThread, cpus };
