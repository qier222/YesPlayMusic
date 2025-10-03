import { IOptions, IAudioMetadata, ParserType } from './type';
import { ITokenizer } from 'strtok3/lib/core';
import { INativeMetadataCollector } from './common/MetadataCollector';
export interface ITokenParser {
    /**
     * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
     * @param metadata - Output
     * @param tokenizer - Input
     * @param options - Parsing options
     */
    init(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): ITokenParser;
    /**
     * Parse audio track.
     * Called after init(...).
     * @returns Promise
     */
    parse(): Promise<void>;
}
export declare function parseHttpContentType(contentType: string): {
    type: string;
    subtype: string;
    suffix?: string;
    parameters: {
        [id: string]: string;
    };
};
export declare class ParserFactory {
    /**
     * Parse metadata from tokenizer
     * @param tokenizer - Tokenizer
     * @param opts - Options
     * @returns Native metadata
     */
    static parseOnContentType(tokenizer: ITokenizer, opts: IOptions): Promise<IAudioMetadata>;
    static parse(tokenizer: ITokenizer, parserId: ParserType, opts: IOptions): Promise<IAudioMetadata>;
    /**
     * @param filePath - Path, filename or extension to audio file
     * @return Parser sub-module name
     */
    static getParserIdForExtension(filePath: string): ParserType;
    static loadParser(moduleName: ParserType): Promise<ITokenParser>;
    private static getExtension;
    /**
     * @param httpContentType - HTTP Content-Type, extension, path or filename
     * @returns Parser sub-module name
     */
    private static getParserIdForMimeType;
}
