/**
 * Promise
 *
 * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
 * @template T
 * @template [E=Error]
 * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
 * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
 */
export function Promise<T, E = Error>(handler: Function, parent?: Promise<any, Error>): void;
export class Promise<T, E = Error> {
    /**
     * Promise
     *
     * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
     * @template T
     * @template [E=Error]
     * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
     * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
     */
    constructor(handler: Function, parent?: Promise<any, Error>);
    /**
     * @readonly
     */
    readonly resolved: boolean;
    /**
     * @readonly
     */
    readonly rejected: boolean;
    /**
     * @readonly
     */
    readonly pending: boolean;
    /**
     * Add an onSuccess callback and optionally an onFail callback to the Promise
     * @template TT
     * @template [TE=never]
     * @param {(r: T) => TT | PromiseLike<TT>} onSuccess
     * @param {(r: E) => TE | PromiseLike<TE>} [onFail]
     * @returns {Promise<TT | TE, any>} promise
     */
    then: <TT, TE = never>(onSuccess: (r: T) => TT | PromiseLike<TT>, onFail?: (r: E) => TE | PromiseLike<TE>) => Promise<TT | TE, any>;
    /**
     * Cancel the promise. This will reject the promise with a CancellationError
     * @returns {this} self
     */
    cancel: () => this;
    /**
     * Set a timeout for the promise. If the promise is not resolved within
     * the time, the promise will be cancelled and a TimeoutError is thrown.
     * If the promise is resolved in time, the timeout is removed.
     * @param {number} delay     Delay in milliseconds
     * @returns {this} self
     */
    timeout: (delay: number) => this;
    /**
     * Add an onFail callback to the Promise
     * @template TT
     * @param {(error: E) => TT | PromiseLike<TT>} onFail
     * @returns {Promise<T | TT>} promise
     */
    catch<TT>(onFail: (error: E) => TT | PromiseLike<TT>): Promise<T | TT>;
    /**
     * Execute given callback when the promise either resolves or rejects.
     * @template TT
     * @param {() => Promise<TT>} fn
     * @returns {Promise<TT>} promise
     */
    always<TT>(fn: () => Promise<TT>): Promise<TT>;
    /**
      * Execute given callback when the promise either resolves or rejects.
      * Same semantics as Node's Promise.finally()
      * @param {Function | null | undefined} [fn]
      * @returns {Promise} promise
      */
    finally(fn?: Function | null | undefined): Promise<any, Error>;
    /**
     * @readonly
     */
    readonly [Symbol.toStringTag]: string;
}
export namespace Promise {
    /**
     * Create a promise which resolves when all provided promises are resolved,
     * and fails when any of the promises resolves.
     * @param {Promise[]} promises
     * @returns {Promise<any[], any>} promise
     */
    export function all(promises: Promise<any, Error>[]): Promise<any[], any>;
    /**
     * Create a promise resolver
     * @returns {{promise: Promise, resolve: Function, reject: Function}} resolver
     */
    export function defer(): {
        promise: Promise<any, Error>;
        resolve: Function;
        reject: Function;
    };
    export { CancellationError };
    export { TimeoutError };
}
/**
 * Create a cancellation error
 * @param {String} [message]
 * @extends Error
 */
declare function CancellationError(message?: string): void;
declare class CancellationError {
    /**
     * Create a cancellation error
     * @param {String} [message]
     * @extends Error
     */
    constructor(message?: string);
    message: string;
    stack: string | undefined;
    name: string;
}
/**
 * Create a timeout error
 * @param {String} [message]
 * @extends Error
 */
declare function TimeoutError(message?: string): void;
declare class TimeoutError {
    /**
     * Create a timeout error
     * @param {String} [message]
     * @extends Error
     */
    constructor(message?: string);
    message: string;
    stack: string | undefined;
    name: string;
}
export {};
