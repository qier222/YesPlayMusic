/// <reference types="node" />
import * as Stream from 'stream';
import * as strtok3 from 'strtok3';
import * as Core from './core';
import { IAudioMetadata, IOptions } from './type';
export { IAudioMetadata, IOptions, ITag, INativeTagDict, ICommonTagsResult, IFormat, IPicture, IRatio, IChapter } from './type';
export { parseFromTokenizer, parseBuffer, IFileInfo, selectCover } from './core';
/**
 * Parse audio from Node Stream.Readable
 * @param stream - Stream to read the audio track from
 * @param fileInfo - File information object or MIME-type, e.g.: 'audio/mpeg'
 * @param options - Parsing options
 * @returns Metadata
 */
export declare function parseStream(stream: Stream.Readable, fileInfo?: strtok3.IFileInfo | string, options?: IOptions): Promise<IAudioMetadata>;
/**
 * Parse audio from Node file
 * @param filePath - Media file to read meta-data from
 * @param options - Parsing options
 * @returns Metadata
 */
export declare function parseFile(filePath: string, options?: IOptions): Promise<IAudioMetadata>;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param nativeTags - List of tags
 * @returns Tags indexed by id
 */
export declare const orderTags: typeof Core.orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param rating - Normalized rating [0..1] (common.rating[n].rating)
 * @returns Number of stars: 1, 2, 3, 4 or 5 stars
 */
export declare const ratingToStars: typeof Core.ratingToStars;
/**
 * Define default module exports
 */
declare const _default: {
    parseStream: typeof parseStream;
    parseFile: typeof parseFile;
    parseFromTokenizer: typeof Core.parseFromTokenizer;
    parseBuffer: typeof Core.parseBuffer;
    selectCover: typeof Core.selectCover;
};
export default _default;
