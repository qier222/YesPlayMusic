"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VorbisParser = void 0;
const Token = require("token-types");
const debug_1 = require("debug");
const VorbisDecoder_1 = require("./VorbisDecoder");
const Vorbis_1 = require("./Vorbis");
const debug = (0, debug_1.default)('music-metadata:parser:ogg:vorbis1');
/**
 * Vorbis 1 Parser.
 * Used by OggParser
 */
class VorbisParser {
    constructor(metadata, options) {
        this.metadata = metadata;
        this.options = options;
        this.pageSegments = [];
    }
    /**
     * Vorbis 1 parser
     * @param header Ogg Page Header
     * @param pageData Page data
     */
    parsePage(header, pageData) {
        if (header.headerType.firstPage) {
            this.parseFirstPage(header, pageData);
        }
        else {
            if (header.headerType.continued) {
                if (this.pageSegments.length === 0) {
                    throw new Error("Cannot continue on previous page");
                }
                this.pageSegments.push(pageData);
            }
            if (header.headerType.lastPage || !header.headerType.continued) {
                // Flush page segments
                if (this.pageSegments.length > 0) {
                    const fullPage = Buffer.concat(this.pageSegments);
                    this.parseFullPage(fullPage);
                }
                // Reset page segments
                this.pageSegments = header.headerType.lastPage ? [] : [pageData];
            }
        }
        if (header.headerType.lastPage) {
            this.calculateDuration(header);
        }
    }
    flush() {
        this.parseFullPage(Buffer.concat(this.pageSegments));
    }
    parseUserComment(pageData, offset) {
        const decoder = new VorbisDecoder_1.VorbisDecoder(pageData, offset);
        const tag = decoder.parseUserComment();
        this.addTag(tag.key, tag.value);
        return tag.len;
    }
    addTag(id, value) {
        if (id === 'METADATA_BLOCK_PICTURE' && (typeof value === 'string')) {
            if (this.options.skipCovers) {
                debug(`Ignore picture`);
                return;
            }
            value = Vorbis_1.VorbisPictureToken.fromBase64(value);
            debug(`Push picture: id=${id}, format=${value.format}`);
        }
        else {
            debug(`Push tag: id=${id}, value=${value}`);
        }
        this.metadata.addTag('vorbis', id, value);
    }
    calculateDuration(header) {
        if (this.metadata.format.sampleRate && header.absoluteGranulePosition >= 0) {
            // Calculate duration
            this.metadata.setFormat('numberOfSamples', header.absoluteGranulePosition);
            this.metadata.setFormat('duration', this.metadata.format.numberOfSamples / this.metadata.format.sampleRate);
        }
    }
    /**
     * Parse first Ogg/Vorbis page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    parseFirstPage(header, pageData) {
        this.metadata.setFormat('codec', 'Vorbis I');
        debug("Parse first page");
        // Parse  Vorbis common header
        const commonHeader = Vorbis_1.CommonHeader.get(pageData, 0);
        if (commonHeader.vorbis !== 'vorbis')
            throw new Error('Metadata does not look like Vorbis');
        if (commonHeader.packetType === 1) {
            const idHeader = Vorbis_1.IdentificationHeader.get(pageData, Vorbis_1.CommonHeader.len);
            this.metadata.setFormat('sampleRate', idHeader.sampleRate);
            this.metadata.setFormat('bitrate', idHeader.bitrateNominal);
            this.metadata.setFormat('numberOfChannels', idHeader.channelMode);
            debug("sample-rate=%s[hz], bitrate=%s[b/s], channel-mode=%s", idHeader.sampleRate, idHeader.bitrateNominal, idHeader.channelMode);
        }
        else
            throw new Error('First Ogg page should be type 1: the identification header');
    }
    parseFullPage(pageData) {
        // New page
        const commonHeader = Vorbis_1.CommonHeader.get(pageData, 0);
        debug("Parse full page: type=%s, byteLength=%s", commonHeader.packetType, pageData.byteLength);
        switch (commonHeader.packetType) {
            case 3: //  type 3: comment header
                return this.parseUserCommentList(pageData, Vorbis_1.CommonHeader.len);
            case 1: // type 1: the identification header
            case 5: // type 5: setup header type
                break; // ignore
        }
    }
    /**
     * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-840005.2
     */
    parseUserCommentList(pageData, offset) {
        const strLen = Token.UINT32_LE.get(pageData, offset);
        offset += 4;
        // const vendorString = new Token.StringType(strLen, 'utf-8').get(pageData, offset);
        offset += strLen;
        let userCommentListLength = Token.UINT32_LE.get(pageData, offset);
        offset += 4;
        while (userCommentListLength-- > 0) {
            offset += this.parseUserComment(pageData, offset);
        }
    }
}
exports.VorbisParser = VorbisParser;
