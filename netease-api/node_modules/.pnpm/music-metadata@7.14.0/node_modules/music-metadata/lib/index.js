"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingToStars = exports.orderTags = exports.parseFile = exports.parseStream = exports.selectCover = exports.parseBuffer = exports.parseFromTokenizer = void 0;
const strtok3 = require("strtok3");
const Core = require("./core");
const ParserFactory_1 = require("./ParserFactory");
const debug_1 = require("debug");
const RandomFileReader_1 = require("./common/RandomFileReader");
const debug = (0, debug_1.default)("music-metadata:parser");
var core_1 = require("./core");
Object.defineProperty(exports, "parseFromTokenizer", { enumerable: true, get: function () { return core_1.parseFromTokenizer; } });
Object.defineProperty(exports, "parseBuffer", { enumerable: true, get: function () { return core_1.parseBuffer; } });
Object.defineProperty(exports, "selectCover", { enumerable: true, get: function () { return core_1.selectCover; } });
/**
 * Parse audio from Node Stream.Readable
 * @param stream - Stream to read the audio track from
 * @param fileInfo - File information object or MIME-type, e.g.: 'audio/mpeg'
 * @param options - Parsing options
 * @returns Metadata
 */
async function parseStream(stream, fileInfo, options = {}) {
    const tokenizer = await strtok3.fromStream(stream, typeof fileInfo === 'string' ? { mimeType: fileInfo } : fileInfo);
    return Core.parseFromTokenizer(tokenizer, options);
}
exports.parseStream = parseStream;
/**
 * Parse audio from Node file
 * @param filePath - Media file to read meta-data from
 * @param options - Parsing options
 * @returns Metadata
 */
async function parseFile(filePath, options = {}) {
    debug(`parseFile: ${filePath}`);
    const fileTokenizer = await strtok3.fromFile(filePath);
    const fileReader = await RandomFileReader_1.RandomFileReader.init(filePath, fileTokenizer.fileInfo.size);
    try {
        await Core.scanAppendingHeaders(fileReader, options);
    }
    finally {
        await fileReader.close();
    }
    try {
        const parserName = ParserFactory_1.ParserFactory.getParserIdForExtension(filePath);
        if (!parserName)
            debug(' Parser could not be determined by file extension');
        return await ParserFactory_1.ParserFactory.parse(fileTokenizer, parserName, options);
    }
    finally {
        await fileTokenizer.close();
    }
}
exports.parseFile = parseFile;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param nativeTags - List of tags
 * @returns Tags indexed by id
 */
exports.orderTags = Core.orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param rating - Normalized rating [0..1] (common.rating[n].rating)
 * @returns Number of stars: 1, 2, 3, 4 or 5 stars
 */
exports.ratingToStars = Core.ratingToStars;
/**
 * Define default module exports
 */
exports.default = {
    parseStream,
    parseFile,
    parseFromTokenizer: Core.parseFromTokenizer,
    parseBuffer: Core.parseBuffer,
    selectCover: Core.selectCover
};
