export = Transfer;
/**
 * The helper class for transferring data from the worker to the main thread.
 *
 * @param {Object} message The object to deliver to the main thread.
 * @param {Object[]} transfer An array of transferable Objects to transfer ownership of.
 */
declare function Transfer(message: Object, transfer: Object[]): void;
declare class Transfer {
    /**
     * The helper class for transferring data from the worker to the main thread.
     *
     * @param {Object} message The object to deliver to the main thread.
     * @param {Object[]} transfer An array of transferable Objects to transfer ownership of.
     */
    constructor(message: Object, transfer: Object[]);
    message: Object;
    transfer: Object[];
}
