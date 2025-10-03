"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamReader = void 0;
const Token = require("token-types");
const debug_1 = require("debug");
const util = require("../../common/Util");
const debug = (0, debug_1.default)('music-metadata:parser:musepack:sv8');
const PacketKey = new Token.StringType(2, 'binary');
/**
 * Stream Header Packet part 1
 * Ref: http://trac.musepack.net/musepack/wiki/SV8Specification#StreamHeaderPacket
 */
const SH_part1 = {
    len: 5,
    get: (buf, off) => {
        return {
            crc: Token.UINT32_LE.get(buf, off),
            streamVersion: Token.UINT8.get(buf, off + 4)
        };
    }
};
/**
 * Stream Header Packet part 3
 * Ref: http://trac.musepack.net/musepack/wiki/SV8Specification#StreamHeaderPacket
 */
const SH_part3 = {
    len: 2,
    get: (buf, off) => {
        return {
            sampleFrequency: [44100, 48000, 37800, 32000][util.getBitAllignedNumber(buf, off, 0, 3)],
            maxUsedBands: util.getBitAllignedNumber(buf, off, 3, 5),
            channelCount: util.getBitAllignedNumber(buf, off + 1, 0, 4) + 1,
            msUsed: util.isBitSet(buf, off + 1, 4),
            audioBlockFrames: util.getBitAllignedNumber(buf, off + 1, 5, 3)
        };
    }
};
class StreamReader {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
    }
    async readPacketHeader() {
        const key = await this.tokenizer.readToken(PacketKey);
        const size = await this.readVariableSizeField();
        return {
            key,
            payloadLength: size.value - 2 - size.len
        };
    }
    async readStreamHeader(size) {
        const streamHeader = {};
        debug(`Reading SH at offset=${this.tokenizer.position}`);
        const part1 = await this.tokenizer.readToken(SH_part1);
        size -= SH_part1.len;
        Object.assign(streamHeader, part1);
        debug(`SH.streamVersion = ${part1.streamVersion}`);
        const sampleCount = await this.readVariableSizeField();
        size -= sampleCount.len;
        streamHeader.sampleCount = sampleCount.value;
        const bs = await this.readVariableSizeField();
        size -= bs.len;
        streamHeader.beginningOfSilence = bs.value;
        const part3 = await this.tokenizer.readToken(SH_part3);
        size -= SH_part3.len;
        Object.assign(streamHeader, part3);
        // assert.equal(size, 0);
        await this.tokenizer.ignore(size);
        return streamHeader;
    }
    async readVariableSizeField(len = 1, hb = 0) {
        let n = await this.tokenizer.readNumber(Token.UINT8);
        if ((n & 0x80) === 0) {
            return { len, value: hb + n };
        }
        n &= 0x7F;
        n += hb;
        return this.readVariableSizeField(len + 1, n << 7);
    }
}
exports.StreamReader = StreamReader;
