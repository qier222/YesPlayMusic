"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APEv2Parser = void 0;
const debug_1 = require("debug");
const strtok3 = require("strtok3/lib/core");
const token_types_1 = require("token-types");
const util = require("../common/Util");
const BasicParser_1 = require("../common/BasicParser");
const APEv2Token_1 = require("./APEv2Token");
const debug = (0, debug_1.default)('music-metadata:parser:APEv2');
const tagFormat = 'APEv2';
const preamble = 'APETAGEX';
class APEv2Parser extends BasicParser_1.BasicParser {
    constructor() {
        super(...arguments);
        this.ape = {};
    }
    static tryParseApeHeader(metadata, tokenizer, options) {
        const apeParser = new APEv2Parser();
        apeParser.init(metadata, tokenizer, options);
        return apeParser.tryParseApeHeader();
    }
    /**
     * Calculate the media file duration
     * @param ah ApeHeader
     * @return {number} duration in seconds
     */
    static calculateDuration(ah) {
        let duration = ah.totalFrames > 1 ? ah.blocksPerFrame * (ah.totalFrames - 1) : 0;
        duration += ah.finalFrameBlocks;
        return duration / ah.sampleRate;
    }
    /**
     * Calculates the APEv1 / APEv2 first field offset
     * @param reader
     * @param offset
     */
    static async findApeFooterOffset(reader, offset) {
        // Search for APE footer header at the end of the file
        const apeBuf = Buffer.alloc(APEv2Token_1.TagFooter.len);
        await reader.randomRead(apeBuf, 0, APEv2Token_1.TagFooter.len, offset - APEv2Token_1.TagFooter.len);
        const tagFooter = APEv2Token_1.TagFooter.get(apeBuf, 0);
        if (tagFooter.ID === 'APETAGEX') {
            debug(`APE footer header at offset=${offset}`);
            return { footer: tagFooter, offset: offset - tagFooter.size };
        }
    }
    static parseTagFooter(metadata, buffer, options) {
        const footer = APEv2Token_1.TagFooter.get(buffer, buffer.length - APEv2Token_1.TagFooter.len);
        if (footer.ID !== preamble)
            throw new Error('Unexpected APEv2 Footer ID preamble value.');
        strtok3.fromBuffer(buffer);
        const apeParser = new APEv2Parser();
        apeParser.init(metadata, strtok3.fromBuffer(buffer), options);
        return apeParser.parseTags(footer);
    }
    /**
     * Parse APEv1 / APEv2 header if header signature found
     */
    async tryParseApeHeader() {
        if (this.tokenizer.fileInfo.size && this.tokenizer.fileInfo.size - this.tokenizer.position < APEv2Token_1.TagFooter.len) {
            debug(`No APEv2 header found, end-of-file reached`);
            return;
        }
        const footer = await this.tokenizer.peekToken(APEv2Token_1.TagFooter);
        if (footer.ID === preamble) {
            await this.tokenizer.ignore(APEv2Token_1.TagFooter.len);
            return this.parseTags(footer);
        }
        else {
            debug(`APEv2 header not found at offset=${this.tokenizer.position}`);
            if (this.tokenizer.fileInfo.size) {
                // Try to read the APEv2 header using just the footer-header
                const remaining = this.tokenizer.fileInfo.size - this.tokenizer.position; // ToDo: take ID3v1 into account
                const buffer = Buffer.alloc(remaining);
                await this.tokenizer.readBuffer(buffer);
                return APEv2Parser.parseTagFooter(this.metadata, buffer, this.options);
            }
        }
    }
    async parse() {
        const descriptor = await this.tokenizer.readToken(APEv2Token_1.DescriptorParser);
        if (descriptor.ID !== 'MAC ')
            throw new Error('Unexpected descriptor ID');
        this.ape.descriptor = descriptor;
        const lenExp = descriptor.descriptorBytes - APEv2Token_1.DescriptorParser.len;
        const header = await (lenExp > 0 ? this.parseDescriptorExpansion(lenExp) : this.parseHeader());
        await this.tokenizer.ignore(header.forwardBytes);
        return this.tryParseApeHeader();
    }
    async parseTags(footer) {
        const keyBuffer = Buffer.alloc(256); // maximum tag key length
        let bytesRemaining = footer.size - APEv2Token_1.TagFooter.len;
        debug(`Parse APE tags at offset=${this.tokenizer.position}, size=${bytesRemaining}`);
        for (let i = 0; i < footer.fields; i++) {
            if (bytesRemaining < APEv2Token_1.TagItemHeader.len) {
                this.metadata.addWarning(`APEv2 Tag-header: ${footer.fields - i} items remaining, but no more tag data to read.`);
                break;
            }
            // Only APEv2 tag has tag item headers
            const tagItemHeader = await this.tokenizer.readToken(APEv2Token_1.TagItemHeader);
            bytesRemaining -= APEv2Token_1.TagItemHeader.len + tagItemHeader.size;
            await this.tokenizer.peekBuffer(keyBuffer, { length: Math.min(keyBuffer.length, bytesRemaining) });
            let zero = util.findZero(keyBuffer, 0, keyBuffer.length);
            const key = await this.tokenizer.readToken(new token_types_1.StringType(zero, 'ascii'));
            await this.tokenizer.ignore(1);
            bytesRemaining -= key.length + 1;
            switch (tagItemHeader.flags.dataType) {
                case APEv2Token_1.DataType.text_utf8: { // utf-8 text-string
                    const value = await this.tokenizer.readToken(new token_types_1.StringType(tagItemHeader.size, 'utf8'));
                    const values = value.split(/\x00/g);
                    for (const val of values) {
                        this.metadata.addTag(tagFormat, key, val);
                    }
                    break;
                }
                case APEv2Token_1.DataType.binary: // binary (probably artwork)
                    if (this.options.skipCovers) {
                        await this.tokenizer.ignore(tagItemHeader.size);
                    }
                    else {
                        const picData = Buffer.alloc(tagItemHeader.size);
                        await this.tokenizer.readBuffer(picData);
                        zero = util.findZero(picData, 0, picData.length);
                        const description = picData.toString('utf8', 0, zero);
                        const data = Buffer.from(picData.slice(zero + 1));
                        this.metadata.addTag(tagFormat, key, {
                            description,
                            data
                        });
                    }
                    break;
                case APEv2Token_1.DataType.external_info:
                    debug(`Ignore external info ${key}`);
                    await this.tokenizer.ignore(tagItemHeader.size);
                    break;
                case APEv2Token_1.DataType.reserved:
                    debug(`Ignore external info ${key}`);
                    this.metadata.addWarning(`APEv2 header declares a reserved datatype for "${key}"`);
                    await this.tokenizer.ignore(tagItemHeader.size);
                    break;
            }
        }
    }
    async parseDescriptorExpansion(lenExp) {
        await this.tokenizer.ignore(lenExp);
        return this.parseHeader();
    }
    async parseHeader() {
        const header = await this.tokenizer.readToken(APEv2Token_1.Header);
        // ToDo before
        this.metadata.setFormat('lossless', true);
        this.metadata.setFormat('container', 'Monkey\'s Audio');
        this.metadata.setFormat('bitsPerSample', header.bitsPerSample);
        this.metadata.setFormat('sampleRate', header.sampleRate);
        this.metadata.setFormat('numberOfChannels', header.channel);
        this.metadata.setFormat('duration', APEv2Parser.calculateDuration(header));
        return {
            forwardBytes: this.ape.descriptor.seekTableBytes + this.ape.descriptor.headerDataBytes +
                this.ape.descriptor.apeFrameDataBytes + this.ape.descriptor.terminatingDataBytes
        };
    }
}
exports.APEv2Parser = APEv2Parser;
