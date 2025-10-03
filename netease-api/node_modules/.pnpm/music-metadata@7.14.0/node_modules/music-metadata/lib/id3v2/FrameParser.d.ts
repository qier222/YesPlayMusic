import { ID3v2MajorVersion } from './ID3v2Token';
import { IWarningCollector } from '../common/MetadataCollector';
export declare function parseGenre(origVal: string): string[];
export declare class FrameParser {
    private major;
    private warningCollector;
    /**
     * Create id3v2 frame parser
     * @param major - Major version, e.g. (4) for  id3v2.4
     * @param warningCollector - Used to collect decode issue
     */
    constructor(major: ID3v2MajorVersion, warningCollector: IWarningCollector);
    readData(uint8Array: Uint8Array, type: string, includeCovers: boolean): any;
    protected static fixPictureMimeType(pictureType: string): string;
    /**
     * Converts TMCL (Musician credits list) or TIPL (Involved people list)
     * @param entries
     */
    private static functionList;
    /**
     * id3v2.4 defines that multiple T* values are separated by 0x00
     * id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
     * @param tag - Tag name
     * @param text - Concatenated tag value
     * @returns Split tag value
     */
    private splitValue;
    private static trimArray;
    private static readIdentifierAndData;
    private static getNullTerminatorLength;
}
