import { ITokenizer } from 'strtok3/lib/core';
import { BasicParser } from '../common/BasicParser';
/**
 * Abstract parser which tries take ID3v2 and ID3v1 headers.
 */
export declare abstract class AbstractID3Parser extends BasicParser {
    static startsWithID3v2Header(tokenizer: ITokenizer): Promise<boolean>;
    private id3parser;
    parse(): Promise<void>;
    /**
     * Called after ID3v2 headers are parsed
     */
    abstract postId3v2Parse(): Promise<void>;
    protected finalize(): void;
    private parseID3v2;
    private tryReadId3v2Headers;
}
