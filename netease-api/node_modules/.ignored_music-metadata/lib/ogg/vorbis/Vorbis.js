"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentificationHeader = exports.CommonHeader = exports.VorbisPictureToken = void 0;
const Token = require("token-types");
const ID3v2Token_1 = require("../../id3v2/ID3v2Token");
/**
 * Parse the METADATA_BLOCK_PICTURE
 * Ref: https://wiki.xiph.org/VorbisComment#METADATA_BLOCK_PICTURE
 * Ref: https://xiph.org/flac/format.html#metadata_block_picture
 * // ToDo: move to ID3 / APIC?
 */
class VorbisPictureToken {
    static fromBase64(base64str) {
        return this.fromBuffer(Buffer.from(base64str, 'base64'));
    }
    static fromBuffer(buffer) {
        const pic = new VorbisPictureToken(buffer.length);
        return pic.get(buffer, 0);
    }
    constructor(len) {
        this.len = len;
    }
    get(buffer, offset) {
        const type = ID3v2Token_1.AttachedPictureType[Token.UINT32_BE.get(buffer, offset)];
        const mimeLen = Token.UINT32_BE.get(buffer, offset += 4);
        const format = buffer.toString('utf-8', offset += 4, offset + mimeLen);
        const descLen = Token.UINT32_BE.get(buffer, offset += mimeLen);
        const description = buffer.toString('utf-8', offset += 4, offset + descLen);
        const width = Token.UINT32_BE.get(buffer, offset += descLen);
        const height = Token.UINT32_BE.get(buffer, offset += 4);
        const colour_depth = Token.UINT32_BE.get(buffer, offset += 4);
        const indexed_color = Token.UINT32_BE.get(buffer, offset += 4);
        const picDataLen = Token.UINT32_BE.get(buffer, offset += 4);
        const data = Buffer.from(buffer.slice(offset += 4, offset + picDataLen));
        return {
            type,
            format,
            description,
            width,
            height,
            colour_depth,
            indexed_color,
            data
        };
    }
}
exports.VorbisPictureToken = VorbisPictureToken;
/**
 * Comment header decoder
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-620004.2.1
 */
exports.CommonHeader = {
    len: 7,
    get: (buf, off) => {
        return {
            packetType: buf.readUInt8(off),
            vorbis: new Token.StringType(6, 'ascii').get(buf, off + 1)
        };
    }
};
/**
 * Identification header decoder
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-630004.2.2
 */
exports.IdentificationHeader = {
    len: 23,
    get: (uint8Array, off) => {
        const dataView = new DataView(uint8Array.buffer, uint8Array.byteOffset);
        return {
            version: dataView.getUint32(off + 0, true),
            channelMode: dataView.getUint8(off + 4),
            sampleRate: dataView.getUint32(off + 5, true),
            bitrateMax: dataView.getUint32(off + 9, true),
            bitrateNominal: dataView.getUint32(off + 13, true),
            bitrateMin: dataView.getUint32(off + 17, true)
        };
    }
};
