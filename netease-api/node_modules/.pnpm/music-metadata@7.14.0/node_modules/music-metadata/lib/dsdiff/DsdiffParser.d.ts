import { BasicParser } from '../common/BasicParser';
/**
 * DSDIFF - Direct Stream Digital Interchange File Format (Phillips)
 *
 * Ref:
 * - http://www.sonicstudio.com/pdf/dsd/DSDIFF_1.5_Spec.pdf
 */
export declare class DsdiffParser extends BasicParser {
    parse(): Promise<void>;
    private readFmt8Chunks;
    private readData;
    private handleSoundPropertyChunks;
    private handleChannelChunks;
}
