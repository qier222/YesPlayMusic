import { ITokenizer } from 'strtok3/lib/core';
import { INativeMetadataCollector } from '../common/MetadataCollector';
import { IOptions } from '../type';
import { ITokenParser } from '../ParserFactory';
import { BasicParser } from '../common/BasicParser';
/**
 * Extensible Binary Meta Language (EBML) parser
 * https://en.wikipedia.org/wiki/Extensible_Binary_Meta_Language
 * http://matroska.sourceforge.net/technical/specs/rfc/index.html
 *
 * WEBM VP8 AUDIO FILE
 */
export declare class MatroskaParser extends BasicParser {
    private padding;
    private parserMap;
    private ebmlMaxIDLength;
    private ebmlMaxSizeLength;
    constructor();
    /**
     * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
     * @param {INativeMetadataCollector} metadata Output
     * @param {ITokenizer} tokenizer Input
     * @param {IOptions} options Parsing options
     */
    init(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): ITokenParser;
    parse(): Promise<void>;
    private parseContainer;
    private readVintData;
    private readElement;
    private isMaxValue;
    private readFloat;
    private readFlag;
    private readUint;
    private readString;
    private readBuffer;
    private addTag;
}
