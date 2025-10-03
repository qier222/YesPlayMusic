import { AbstractID3Parser } from '../id3v2/AbstractID3Parser';
export declare class MpegParser extends AbstractID3Parser {
    private frameCount;
    private syncFrameCount;
    private countSkipFrameData;
    private totalDataLength;
    private audioFrameHeader;
    private bitrates;
    private offset;
    private frame_size;
    private crc;
    private calculateEofDuration;
    private samplesPerFrame;
    private buf_frame_header;
    /**
     * Number of bytes already parsed since beginning of stream / file
     */
    private mpegOffset;
    private syncPeek;
    /**
     * Called after ID3 headers have been parsed
     */
    postId3v2Parse(): Promise<void>;
    /**
     * Called after file has been fully parsed, this allows, if present, to exclude the ID3v1.1 header length
     */
    protected finalize(): void;
    private sync;
    /**
     * Combined ADTS & MPEG (MP2 & MP3) header handling
     * @return {Promise<boolean>} true if parser should quit
     */
    private parseCommonMpegHeader;
    /**
     * @return {Promise<boolean>} true if parser should quit
     */
    private parseAudioFrameHeader;
    private parseAdts;
    private parseCrc;
    private skipSideInformation;
    private readXtraInfoHeader;
    /**
     * Ref: http://gabriel.mp3-tech.org/mp3infotag.html
     * @returns {Promise<string>}
     */
    private readXingInfoHeader;
    private skipFrameData;
    private areAllSame;
}
