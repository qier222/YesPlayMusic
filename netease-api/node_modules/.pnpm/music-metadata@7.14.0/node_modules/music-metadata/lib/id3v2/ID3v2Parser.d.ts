import { ITokenizer } from 'strtok3/lib/core';
import { IOptions } from '../type';
import { INativeMetadataCollector } from '../common/MetadataCollector';
export declare class ID3v2Parser {
    static removeUnsyncBytes(buffer: Uint8Array): Uint8Array;
    private static getFrameHeaderLength;
    private static readFrameFlags;
    private static readFrameData;
    /**
     * Create a combined tag key, of tag & description
     * @param tag e.g.: COM
     * @param description e.g. iTunPGAP
     * @returns string e.g. COM:iTunPGAP
     */
    private static makeDescriptionTagName;
    private tokenizer;
    private id3Header;
    private metadata;
    private headerType;
    private options;
    parse(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): Promise<void>;
    parseExtendedHeader(): Promise<void>;
    parseExtendedHeaderData(dataRemaining: number, extendedHeaderSize: number): Promise<void>;
    parseId3Data(dataLen: number): Promise<void>;
    private addTag;
    private parseMetadata;
    private readFrameHeader;
}
