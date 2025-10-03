import { IRandomReader } from '../type';
/**
 * Provides abstract Uint8Array access via the IRandomRead interface
 */
export declare class RandomUint8ArrayReader implements IRandomReader {
    private readonly uint8Array;
    readonly fileSize: number;
    constructor(uint8Array: Uint8Array);
    /**
     * Read from a given position of an abstracted file or buffer.
     * @param uint8Array - Uint8Array that the data will be written to.
     * @param offset - Offset in the buffer to start writing at.
     * @param length - Integer specifying the number of bytes to read.
     * @param position - Specifies where to begin reading from in the file.
     * @return Promise providing bytes read
     */
    randomRead(uint8Array: Uint8Array, offset: number, length: number, position: number): Promise<number>;
}
