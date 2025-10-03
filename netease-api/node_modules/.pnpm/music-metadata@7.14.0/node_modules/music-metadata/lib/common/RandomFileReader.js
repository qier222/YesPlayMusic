"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomFileReader = void 0;
const fs = require("fs");
/**
 * Provides abstract file access via the IRandomRead interface
 */
class RandomFileReader {
    constructor(fileHandle, filePath, fileSize) {
        this.fileHandle = fileHandle;
        this.filePath = filePath;
        this.fileSize = fileSize;
    }
    /**
     * Read from a given position of an abstracted file or buffer.
     * @param buffer {Buffer} is the buffer that the data will be written to.
     * @param offset {number} is the offset in the buffer to start writing at.
     * @param length {number}is an integer specifying the number of bytes to read.
     * @param position {number} is an argument specifying where to begin reading from in the file.
     * @return {Promise<number>} bytes read
     */
    async randomRead(buffer, offset, length, position) {
        const result = await this.fileHandle.read(buffer, offset, length, position);
        return result.bytesRead;
    }
    async close() {
        return this.fileHandle.close();
    }
    static async init(filePath, fileSize) {
        const fileHandle = await fs.promises.open(filePath, 'r');
        return new RandomFileReader(fileHandle, filePath, fileSize);
    }
}
exports.RandomFileReader = RandomFileReader;
