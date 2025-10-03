"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentificationHeader = void 0;
const Token = require("token-types");
/**
 * 6.2 Identification Header
 * Ref: https://theora.org/doc/Theora.pdf: 6.2 Identification Header Decode
 */
exports.IdentificationHeader = {
    len: 42,
    get: (buf, off) => {
        return {
            id: new Token.StringType(7, 'ascii').get(buf, off),
            vmaj: buf.readUInt8(off + 7),
            vmin: buf.readUInt8(off + 8),
            vrev: buf.readUInt8(off + 9),
            vmbw: buf.readUInt16BE(off + 10),
            vmbh: buf.readUInt16BE(off + 17),
            nombr: Token.UINT24_BE.get(buf, off + 37),
            nqual: buf.readUInt8(off + 40)
        };
    }
};
