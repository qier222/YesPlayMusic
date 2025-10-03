"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanAppendingHeaders = exports.selectCover = exports.ratingToStars = exports.orderTags = exports.parseFromTokenizer = exports.parseBuffer = exports.parseStream = void 0;
const strtok3 = require("strtok3/lib/core");
const ParserFactory_1 = require("./ParserFactory");
const RandomUint8ArrayReader_1 = require("./common/RandomUint8ArrayReader");
const APEv2Parser_1 = require("./apev2/APEv2Parser");
const ID3v1Parser_1 = require("./id3v1/ID3v1Parser");
const Lyrics3_1 = require("./lyrics3/Lyrics3");
/**
 * Parse audio from Node Stream.Readable
 * @param stream - Stream to read the audio track from
 * @param options - Parsing options
 * @param fileInfo - File information object or MIME-type string
 * @returns Metadata
 */
function parseStream(stream, fileInfo, options = {}) {
    return parseFromTokenizer(strtok3.fromStream(stream, typeof fileInfo === 'string' ? { mimeType: fileInfo } : fileInfo), options);
}
exports.parseStream = parseStream;
/**
 * Parse audio from Node Buffer
 * @param uint8Array - Uint8Array holding audio data
 * @param fileInfo - File information object or MIME-type string
 * @param options - Parsing options
 * @returns Metadata
 * Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
 */
async function parseBuffer(uint8Array, fileInfo, options = {}) {
    const bufferReader = new RandomUint8ArrayReader_1.RandomUint8ArrayReader(uint8Array);
    await scanAppendingHeaders(bufferReader, options);
    const tokenizer = strtok3.fromBuffer(uint8Array, typeof fileInfo === 'string' ? { mimeType: fileInfo } : fileInfo);
    return parseFromTokenizer(tokenizer, options);
}
exports.parseBuffer = parseBuffer;
/**
 * Parse audio from ITokenizer source
 * @param tokenizer - Audio source implementing the tokenizer interface
 * @param options - Parsing options
 * @returns Metadata
 */
function parseFromTokenizer(tokenizer, options) {
    return ParserFactory_1.ParserFactory.parseOnContentType(tokenizer, options);
}
exports.parseFromTokenizer = parseFromTokenizer;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param nativeTags list of tags
 * @returns tags indexed by id
 */
function orderTags(nativeTags) {
    const tags = {};
    for (const tag of nativeTags) {
        (tags[tag.id] = (tags[tag.id] || [])).push(tag.value);
    }
    return tags;
}
exports.orderTags = orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param rating: Normalized rating [0..1] (common.rating[n].rating)
 * @returns Number of stars: 1, 2, 3, 4 or 5 stars
 */
function ratingToStars(rating) {
    return rating === undefined ? 0 : 1 + Math.round(rating * 4);
}
exports.ratingToStars = ratingToStars;
/**
 * Select most likely cover image.
 * @param pictures Usually metadata.common.picture
 * @return Cover image, if any, otherwise null
 */
function selectCover(pictures) {
    return pictures ? pictures.reduce((acc, cur) => {
        if (cur.name && cur.name.toLowerCase() in ['front', 'cover', 'cover (front)'])
            return cur;
        return acc;
    }) : null;
}
exports.selectCover = selectCover;
async function scanAppendingHeaders(randomReader, options = {}) {
    let apeOffset = randomReader.fileSize;
    if (await (0, ID3v1Parser_1.hasID3v1Header)(randomReader)) {
        apeOffset -= 128;
        const lyricsLen = await (0, Lyrics3_1.getLyricsHeaderLength)(randomReader);
        apeOffset -= lyricsLen;
    }
    options.apeHeader = await APEv2Parser_1.APEv2Parser.findApeFooterOffset(randomReader, apeOffset);
}
exports.scanAppendingHeaders = scanAppendingHeaders;
