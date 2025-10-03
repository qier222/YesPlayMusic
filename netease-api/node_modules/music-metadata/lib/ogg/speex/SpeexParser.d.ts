/// <reference types="node" />
import { ITokenizer } from 'strtok3/lib/core';
import { IPageHeader } from '../Ogg';
import { VorbisParser } from '../vorbis/VorbisParser';
import { IOptions } from '../../type';
import { INativeMetadataCollector } from '../../common/MetadataCollector';
/**
 * Speex, RFC 5574
 * Ref:
 * - https://www.speex.org/docs/manual/speex-manual/
 * - https://tools.ietf.org/html/rfc5574
 */
export declare class SpeexParser extends VorbisParser {
    private tokenizer;
    constructor(metadata: INativeMetadataCollector, options: IOptions, tokenizer: ITokenizer);
    /**
     * Parse first Speex Ogg page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    protected parseFirstPage(header: IPageHeader, pageData: Buffer): void;
}
