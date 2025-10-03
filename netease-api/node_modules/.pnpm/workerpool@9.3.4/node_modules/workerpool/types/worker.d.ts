/**
 * Register methods to the worker
 * @param {Object} [methods]
 * @param {import('./types.js').WorkerRegisterOptions} [options]
 */
declare function register(methods?: Object, options?: import("./types.js").WorkerRegisterOptions): void;
export function emit(payload: any): void;
export { register as add };
