/// <reference types="node" />
import { ITokenizer } from 'strtok3/lib/core';
import { IPageHeader } from '../Ogg';
import { VorbisParser } from '../vorbis/VorbisParser';
import { IOptions } from '../../type';
import { INativeMetadataCollector } from '../../common/MetadataCollector';
/**
 * Opus parser
 * Internet Engineering Task Force (IETF) - RFC 6716
 * Used by OggParser
 */
export declare class OpusParser extends VorbisParser {
    private tokenizer;
    private idHeader;
    private lastPos;
    constructor(metadata: INativeMetadataCollector, options: IOptions, tokenizer: ITokenizer);
    /**
     * Parse first Opus Ogg page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    protected parseFirstPage(header: IPageHeader, pageData: Buffer): void;
    protected parseFullPage(pageData: Buffer): void;
    calculateDuration(header: IPageHeader): void;
}
