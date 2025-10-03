/// <reference types="node" />
import { Readable } from 'stream';
import * as strtok3 from 'strtok3/lib/core';
import { IAudioMetadata, INativeTagDict, IOptions, IPicture, IPrivateOptions, IRandomReader, ITag } from './type';
export { IFileInfo } from 'strtok3/lib/core';
/**
 * Parse audio from Node Stream.Readable
 * @param stream - Stream to read the audio track from
 * @param options - Parsing options
 * @param fileInfo - File information object or MIME-type string
 * @returns Metadata
 */
export declare function parseStream(stream: Readable, fileInfo?: strtok3.IFileInfo | string, options?: IOptions): Promise<IAudioMetadata>;
/**
 * Parse audio from Node Buffer
 * @param uint8Array - Uint8Array holding audio data
 * @param fileInfo - File information object or MIME-type string
 * @param options - Parsing options
 * @returns Metadata
 * Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
 */
export declare function parseBuffer(uint8Array: Uint8Array, fileInfo?: strtok3.IFileInfo | string, options?: IOptions): Promise<IAudioMetadata>;
/**
 * Parse audio from ITokenizer source
 * @param tokenizer - Audio source implementing the tokenizer interface
 * @param options - Parsing options
 * @returns Metadata
 */
export declare function parseFromTokenizer(tokenizer: strtok3.ITokenizer, options?: IOptions): Promise<IAudioMetadata>;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param nativeTags list of tags
 * @returns tags indexed by id
 */
export declare function orderTags(nativeTags: ITag[]): INativeTagDict;
/**
 * Convert rating to 1-5 star rating
 * @param rating: Normalized rating [0..1] (common.rating[n].rating)
 * @returns Number of stars: 1, 2, 3, 4 or 5 stars
 */
export declare function ratingToStars(rating: number): number;
/**
 * Select most likely cover image.
 * @param pictures Usually metadata.common.picture
 * @return Cover image, if any, otherwise null
 */
export declare function selectCover(pictures?: IPicture[]): IPicture | null;
export declare function scanAppendingHeaders(randomReader: IRandomReader, options?: IPrivateOptions): Promise<void>;
