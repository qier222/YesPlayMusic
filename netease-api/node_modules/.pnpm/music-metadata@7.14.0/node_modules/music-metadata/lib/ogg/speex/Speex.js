"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const Token = require("token-types");
const util = require("../../common/Util");
/**
 * Speex Header Packet
 * Ref: https://www.speex.org/docs/manual/speex-manual/node8.html#SECTION00830000000000000000
 */
exports.Header = {
    len: 80,
    get: (buf, off) => {
        return {
            speex: new Token.StringType(8, 'ascii').get(buf, off + 0),
            version: util.trimRightNull(new Token.StringType(20, 'ascii').get(buf, off + 8)),
            version_id: buf.readInt32LE(off + 28),
            header_size: buf.readInt32LE(off + 32),
            rate: buf.readInt32LE(off + 36),
            mode: buf.readInt32LE(off + 40),
            mode_bitstream_version: buf.readInt32LE(off + 44),
            nb_channels: buf.readInt32LE(off + 48),
            bitrate: buf.readInt32LE(off + 52),
            frame_size: buf.readInt32LE(off + 56),
            vbr: buf.readInt32LE(off + 60),
            frames_per_packet: buf.readInt32LE(off + 64),
            extra_headers: buf.readInt32LE(off + 68),
            reserved1: buf.readInt32LE(off + 72),
            reserved2: buf.readInt32LE(off + 76)
        };
    }
};
