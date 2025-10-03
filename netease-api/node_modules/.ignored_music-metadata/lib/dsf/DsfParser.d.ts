import { AbstractID3Parser } from '../id3v2/AbstractID3Parser';
/**
 * DSF (dsd stream file) File Parser
 * Ref: https://dsd-guide.com/sites/default/files/white-papers/DSFFileFormatSpec_E.pdf
 */
export declare class DsfParser extends AbstractID3Parser {
    postId3v2Parse(): Promise<void>;
    private parseChunks;
}
