"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactChunk = exports.Format = exports.WaveFormat = void 0;
/**
 * Ref: https://msdn.microsoft.com/en-us/library/windows/desktop/dd317599(v=vs.85).aspx
 */
var WaveFormat;
(function (WaveFormat) {
    WaveFormat[WaveFormat["PCM"] = 1] = "PCM";
    // MPEG-4 and AAC Audio Types
    WaveFormat[WaveFormat["ADPCM"] = 2] = "ADPCM";
    WaveFormat[WaveFormat["IEEE_FLOAT"] = 3] = "IEEE_FLOAT";
    WaveFormat[WaveFormat["MPEG_ADTS_AAC"] = 5632] = "MPEG_ADTS_AAC";
    WaveFormat[WaveFormat["MPEG_LOAS"] = 5634] = "MPEG_LOAS";
    WaveFormat[WaveFormat["RAW_AAC1"] = 255] = "RAW_AAC1";
    // Dolby Audio Types
    WaveFormat[WaveFormat["DOLBY_AC3_SPDIF"] = 146] = "DOLBY_AC3_SPDIF";
    WaveFormat[WaveFormat["DVM"] = 8192] = "DVM";
    WaveFormat[WaveFormat["RAW_SPORT"] = 576] = "RAW_SPORT";
    WaveFormat[WaveFormat["ESST_AC3"] = 577] = "ESST_AC3";
    WaveFormat[WaveFormat["DRM"] = 9] = "DRM";
    WaveFormat[WaveFormat["DTS2"] = 8193] = "DTS2";
    WaveFormat[WaveFormat["MPEG"] = 80] = "MPEG";
})(WaveFormat = exports.WaveFormat || (exports.WaveFormat = {}));
/**
 * format chunk; chunk-id is "fmt "
 * http://soundfile.sapp.org/doc/WaveFormat/
 */
class Format {
    constructor(header) {
        if (header.chunkSize < 16)
            throw new Error('Invalid chunk size');
        this.len = header.chunkSize;
    }
    get(buf, off) {
        return {
            wFormatTag: buf.readUInt16LE(off),
            nChannels: buf.readUInt16LE(off + 2),
            nSamplesPerSec: buf.readUInt32LE(off + 4),
            nAvgBytesPerSec: buf.readUInt32LE(off + 8),
            nBlockAlign: buf.readUInt16LE(off + 12),
            wBitsPerSample: buf.readUInt16LE(off + 14)
        };
    }
}
exports.Format = Format;
/**
 * Fact chunk; chunk-id is "fact"
 * http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
 * http://www.recordingblogs.com/wiki/fact-chunk-of-a-wave-file
 */
class FactChunk {
    constructor(header) {
        if (header.chunkSize < 4) {
            throw new Error('Invalid fact chunk size.');
        }
        this.len = header.chunkSize;
    }
    get(buf, off) {
        return {
            dwSampleLength: buf.readUInt32LE(off)
        };
    }
}
exports.FactChunk = FactChunk;
