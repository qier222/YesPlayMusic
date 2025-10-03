import { ITokenizer } from 'strtok3/lib/core';
import { AbstractID3Parser } from '../id3v2/AbstractID3Parser';
import { INativeMetadataCollector } from '../common/MetadataCollector';
import { IOptions } from '../type';
import { ITokenParser } from '../ParserFactory';
export declare class FlacParser extends AbstractID3Parser {
    private vorbisParser;
    private padding;
    /**
     * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
     * @param {INativeMetadataCollector} metadata Output
     * @param {ITokenizer} tokenizer Input
     * @param {IOptions} options Parsing options
     */
    init(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): ITokenParser;
    postId3v2Parse(): Promise<void>;
    private parseDataBlock;
    /**
     * Parse STREAMINFO
     */
    private parseBlockStreamInfo;
    /**
     * Parse VORBIS_COMMENT
     * Ref: https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-640004.2.3
     */
    private parseComment;
    private parsePicture;
}
