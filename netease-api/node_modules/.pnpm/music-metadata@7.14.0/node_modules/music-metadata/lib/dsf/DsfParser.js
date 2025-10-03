"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DsfParser = void 0;
const debug_1 = require("debug");
const AbstractID3Parser_1 = require("../id3v2/AbstractID3Parser");
const DsfChunk_1 = require("./DsfChunk");
const ID3v2Parser_1 = require("../id3v2/ID3v2Parser");
const debug = (0, debug_1.default)('music-metadata:parser:DSF');
/**
 * DSF (dsd stream file) File Parser
 * Ref: https://dsd-guide.com/sites/default/files/white-papers/DSFFileFormatSpec_E.pdf
 */
class DsfParser extends AbstractID3Parser_1.AbstractID3Parser {
    async postId3v2Parse() {
        const p0 = this.tokenizer.position; // mark start position, normally 0
        const chunkHeader = await this.tokenizer.readToken(DsfChunk_1.ChunkHeader);
        if (chunkHeader.id !== 'DSD ')
            throw new Error('Invalid chunk signature');
        this.metadata.setFormat('container', 'DSF');
        this.metadata.setFormat('lossless', true);
        const dsdChunk = await this.tokenizer.readToken(DsfChunk_1.DsdChunk);
        if (dsdChunk.metadataPointer === BigInt(0)) {
            debug(`No ID3v2 tag present`);
        }
        else {
            debug(`expect ID3v2 at offset=${dsdChunk.metadataPointer}`);
            await this.parseChunks(dsdChunk.fileSize - chunkHeader.size);
            // Jump to ID3 header
            await this.tokenizer.ignore(Number(dsdChunk.metadataPointer) - this.tokenizer.position - p0);
            return new ID3v2Parser_1.ID3v2Parser().parse(this.metadata, this.tokenizer, this.options);
        }
    }
    async parseChunks(bytesRemaining) {
        while (bytesRemaining >= DsfChunk_1.ChunkHeader.len) {
            const chunkHeader = await this.tokenizer.readToken(DsfChunk_1.ChunkHeader);
            debug(`Parsing chunk name=${chunkHeader.id} size=${chunkHeader.size}`);
            switch (chunkHeader.id) {
                case 'fmt ':
                    const formatChunk = await this.tokenizer.readToken(DsfChunk_1.FormatChunk);
                    this.metadata.setFormat('numberOfChannels', formatChunk.channelNum);
                    this.metadata.setFormat('sampleRate', formatChunk.samplingFrequency);
                    this.metadata.setFormat('bitsPerSample', formatChunk.bitsPerSample);
                    this.metadata.setFormat('numberOfSamples', formatChunk.sampleCount);
                    this.metadata.setFormat('duration', Number(formatChunk.sampleCount) / formatChunk.samplingFrequency);
                    const bitrate = formatChunk.bitsPerSample * formatChunk.samplingFrequency * formatChunk.channelNum;
                    this.metadata.setFormat('bitrate', bitrate);
                    return; // We got what we want, stop further processing of chunks
                default:
                    this.tokenizer.ignore(Number(chunkHeader.size) - DsfChunk_1.ChunkHeader.len);
                    break;
            }
            bytesRemaining -= chunkHeader.size;
        }
    }
}
exports.DsfParser = DsfParser;
