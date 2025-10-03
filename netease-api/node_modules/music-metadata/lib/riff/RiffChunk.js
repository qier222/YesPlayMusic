"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListInfoTagValue = exports.Header = void 0;
const Token = require("token-types");
/**
 * Common RIFF chunk header
 */
exports.Header = {
    len: 8,
    get: (buf, off) => {
        return {
            // Group-ID
            chunkID: buf.toString('binary', off, off + 4),
            // Size
            chunkSize: Token.UINT32_LE.get(buf, 4)
        };
    }
};
/**
 * Token to parse RIFF-INFO tag value
 */
class ListInfoTagValue {
    constructor(tagHeader) {
        this.tagHeader = tagHeader;
        this.len = tagHeader.chunkSize;
        this.len += this.len & 1; // if it is an odd length, round up to even
    }
    get(buf, off) {
        return new Token.StringType(this.tagHeader.chunkSize, 'ascii').get(buf, off);
    }
}
exports.ListInfoTagValue = ListInfoTagValue;
