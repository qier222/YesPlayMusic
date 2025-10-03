"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIFFParser = void 0;
const Token = require("token-types");
const debug_1 = require("debug");
const strtok3 = require("strtok3/lib/core");
const ID3v2Parser_1 = require("../id3v2/ID3v2Parser");
const FourCC_1 = require("../common/FourCC");
const BasicParser_1 = require("../common/BasicParser");
const AiffToken = require("./AiffToken");
const iff = require("../iff");
const debug = (0, debug_1.default)('music-metadata:parser:aiff');
const compressionTypes = {
    NONE: 'not compressed	PCM	Apple Computer',
    sowt: 'PCM (byte swapped)',
    fl32: '32-bit floating point IEEE 32-bit float',
    fl64: '64-bit floating point IEEE 64-bit float	Apple Computer',
    alaw: 'ALaw 2:1	8-bit ITU-T G.711 A-law',
    ulaw: 'µLaw 2:1	8-bit ITU-T G.711 µ-law	Apple Computer',
    ULAW: 'CCITT G.711 u-law 8-bit ITU-T G.711 µ-law',
    ALAW: 'CCITT G.711 A-law 8-bit ITU-T G.711 A-law',
    FL32: 'Float 32	IEEE 32-bit float '
};
/**
 * AIFF - Audio Interchange File Format
 *
 * Ref:
 * - http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/AIFF/AIFF.html
 * - http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/AIFF/Docs/AIFF-1.3.pdf
 */
class AIFFParser extends BasicParser_1.BasicParser {
    async parse() {
        const header = await this.tokenizer.readToken(iff.Header);
        if (header.chunkID !== 'FORM')
            throw new Error('Invalid Chunk-ID, expected \'FORM\''); // Not AIFF format
        const type = await this.tokenizer.readToken(FourCC_1.FourCcToken);
        switch (type) {
            case 'AIFF':
                this.metadata.setFormat('container', type);
                this.isCompressed = false;
                break;
            case 'AIFC':
                this.metadata.setFormat('container', 'AIFF-C');
                this.isCompressed = true;
                break;
            default:
                throw Error('Unsupported AIFF type: ' + type);
        }
        this.metadata.setFormat('lossless', !this.isCompressed);
        try {
            while (!this.tokenizer.fileInfo.size || this.tokenizer.fileInfo.size - this.tokenizer.position >= iff.Header.len) {
                debug('Reading AIFF chunk at offset=' + this.tokenizer.position);
                const chunkHeader = await this.tokenizer.readToken(iff.Header);
                const nextChunk = 2 * Math.round(chunkHeader.chunkSize / 2);
                const bytesRead = await this.readData(chunkHeader);
                await this.tokenizer.ignore(nextChunk - bytesRead);
            }
        }
        catch (err) {
            if (err instanceof strtok3.EndOfStreamError) {
                debug(`End-of-stream`);
            }
            else {
                throw err;
            }
        }
    }
    async readData(header) {
        var _a;
        switch (header.chunkID) {
            case 'COMM': // The Common Chunk
                const common = await this.tokenizer.readToken(new AiffToken.Common(header, this.isCompressed));
                this.metadata.setFormat('bitsPerSample', common.sampleSize);
                this.metadata.setFormat('sampleRate', common.sampleRate);
                this.metadata.setFormat('numberOfChannels', common.numChannels);
                this.metadata.setFormat('numberOfSamples', common.numSampleFrames);
                this.metadata.setFormat('duration', common.numSampleFrames / common.sampleRate);
                this.metadata.setFormat('codec', (_a = common.compressionName) !== null && _a !== void 0 ? _a : compressionTypes[common.compressionType]);
                return header.chunkSize;
            case 'ID3 ': // ID3-meta-data
                const id3_data = await this.tokenizer.readToken(new Token.Uint8ArrayType(header.chunkSize));
                const rst = strtok3.fromBuffer(id3_data);
                await new ID3v2Parser_1.ID3v2Parser().parse(this.metadata, rst, this.options);
                return header.chunkSize;
            case 'SSND': // Sound Data Chunk
                if (this.metadata.format.duration) {
                    this.metadata.setFormat('bitrate', 8 * header.chunkSize / this.metadata.format.duration);
                }
                return 0;
            case 'NAME': // Sample name chunk
            case 'AUTH': // Author chunk
            case '(c) ': // Copyright chunk
            case 'ANNO': // Annotation chunk
                return this.readTextChunk(header);
            default:
                debug(`Ignore chunk id=${header.chunkID}, size=${header.chunkSize}`);
                return 0;
        }
    }
    async readTextChunk(header) {
        const value = await this.tokenizer.readToken(new Token.StringType(header.chunkSize, 'ascii'));
        value.split('\0').map(v => v.trim()).filter(v => v && v.length > 0).forEach(v => {
            this.metadata.addTag('AIFF', header.chunkID, v.trim());
        });
        return header.chunkSize;
    }
}
exports.AIFFParser = AIFFParser;
