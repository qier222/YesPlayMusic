import * as strtok3 from 'strtok3/lib/core';
import { IOptions, IRandomReader, IApeHeader } from '../type';
import { INativeMetadataCollector } from '../common/MetadataCollector';
import { BasicParser } from '../common/BasicParser';
import { IFooter, IHeader } from './APEv2Token';
export declare class APEv2Parser extends BasicParser {
    static tryParseApeHeader(metadata: INativeMetadataCollector, tokenizer: strtok3.ITokenizer, options: IOptions): Promise<void>;
    /**
     * Calculate the media file duration
     * @param ah ApeHeader
     * @return {number} duration in seconds
     */
    static calculateDuration(ah: IHeader): number;
    /**
     * Calculates the APEv1 / APEv2 first field offset
     * @param reader
     * @param offset
     */
    static findApeFooterOffset(reader: IRandomReader, offset: number): Promise<IApeHeader>;
    private static parseTagFooter;
    private ape;
    /**
     * Parse APEv1 / APEv2 header if header signature found
     */
    tryParseApeHeader(): Promise<void>;
    parse(): Promise<void>;
    parseTags(footer: IFooter): Promise<void>;
    private parseDescriptorExpansion;
    private parseHeader;
}
