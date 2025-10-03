"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomUint8ArrayReader = void 0;
/**
 * Provides abstract Uint8Array access via the IRandomRead interface
 */
class RandomUint8ArrayReader {
    constructor(uint8Array) {
        this.uint8Array = uint8Array;
        this.fileSize = uint8Array.length;
    }
    /**
     * Read from a given position of an abstracted file or buffer.
     * @param uint8Array - Uint8Array that the data will be written to.
     * @param offset - Offset in the buffer to start writing at.
     * @param length - Integer specifying the number of bytes to read.
     * @param position - Specifies where to begin reading from in the file.
     * @return Promise providing bytes read
     */
    async randomRead(uint8Array, offset, length, position) {
        uint8Array.set(this.uint8Array.subarray(position, position + length), offset);
        return length;
    }
}
exports.RandomUint8ArrayReader = RandomUint8ArrayReader;
