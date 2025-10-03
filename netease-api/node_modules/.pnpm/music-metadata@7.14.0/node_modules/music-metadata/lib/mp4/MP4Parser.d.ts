import { BasicParser } from '../common/BasicParser';
import { Atom } from './Atom';
export declare class MP4Parser extends BasicParser {
    private static read_BE_Integer;
    private audioLengthInBytes;
    private tracks;
    parse(): Promise<void>;
    handleAtom(atom: Atom, remaining: number): Promise<void>;
    private getTrackDescription;
    private calculateBitRate;
    private addTag;
    private addWarning;
    /**
     * Parse data of Meta-item-list-atom (item of 'ilst' atom)
     * @param metaAtom
     * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW8
     */
    private parseMetadataItemData;
    private parseValueAtom;
    private atomParsers;
    /**
     * @param sampleDescription
     * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-128916
     */
    private parseSoundSampleDescription;
    private parseChapterTrack;
    private findSampleOffset;
    private getChunkDuration;
    private getSamplesPerChunk;
}
