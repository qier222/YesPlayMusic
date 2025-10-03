"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastAudioExtensionChunk = void 0;
const Token = require("token-types");
const Util_1 = require("../common/Util");
/**
 * Broadcast Audio Extension Chunk
 * Ref: https://tech.ebu.ch/docs/tech/tech3285.pdf
 */
exports.BroadcastAudioExtensionChunk = {
    len: 420,
    get: (uint8array, off) => {
        return {
            description: (0, Util_1.stripNulls)(new Token.StringType(256, 'ascii').get(uint8array, off)).trim(),
            originator: (0, Util_1.stripNulls)(new Token.StringType(32, 'ascii').get(uint8array, off + 256)).trim(),
            originatorReference: (0, Util_1.stripNulls)(new Token.StringType(32, 'ascii').get(uint8array, off + 288)).trim(),
            originationDate: (0, Util_1.stripNulls)(new Token.StringType(10, 'ascii').get(uint8array, off + 320)).trim(),
            originationTime: (0, Util_1.stripNulls)(new Token.StringType(8, 'ascii').get(uint8array, off + 330)).trim(),
            timeReferenceLow: Token.UINT32_LE.get(uint8array, off + 338),
            timeReferenceHigh: Token.UINT32_LE.get(uint8array, off + 342),
            version: Token.UINT16_LE.get(uint8array, off + 346),
            umid: new Token.Uint8ArrayType(64).get(uint8array, off + 348),
            loudnessValue: Token.UINT16_LE.get(uint8array, off + 412),
            maxTruePeakLevel: Token.UINT16_LE.get(uint8array, off + 414),
            maxMomentaryLoudness: Token.UINT16_LE.get(uint8array, off + 416),
            maxShortTermLoudness: Token.UINT16_LE.get(uint8array, off + 418)
        };
    }
};
