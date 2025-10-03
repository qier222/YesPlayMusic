import { BasicParser } from '../common/BasicParser';
/**
 * WavPack Parser
 */
export declare class WavPackParser extends BasicParser {
    private audioDataSize;
    parse(): Promise<void>;
    parseWavPackBlocks(): Promise<void>;
    /**
     * Ref: http://www.wavpack.com/WavPack5FileFormat.pdf, 3.0 Metadata Sub-blocks
     * @param remainingLength
     */
    private parseMetadataSubBlock;
}
