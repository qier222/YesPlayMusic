import * as Token from 'token-types';
import { IGetToken } from 'strtok3/lib/core';
/**
 * APETag versionIndex history / supported formats
 *
 * 1.0 (1000) - Original APE tag spec.  Fully supported by this code.
 * 2.0 (2000) - Refined APE tag spec (better streaming support, UTF StringEncoding). Fully supported by this code.
 *
 * Notes:
 * - also supports reading of ID3v1.1 tags
 * - all saving done in the APE Tag format using CURRENT_APE_TAG_VERSION
 *
 * APE File Format Overview: (pieces in order -- only valid for the latest versionIndex APE files)
 *
 * JUNK - any amount of "junk" before the APE_DESCRIPTOR (so people that put ID3v2 tags on the files aren't hosed)
 * APE_DESCRIPTOR - defines the sizes (and offsets) of all the pieces, as well as the MD5 checksum
 * APE_HEADER - describes all of the necessary information about the APE file
 * SEEK TABLE - the table that represents seek offsets [optional]
 * HEADER DATA - the pre-audio data from the original file [optional]
 * APE FRAMES - the actual compressed audio (broken into frames for seekability)
 * TERMINATING DATA - the post-audio data from the original file [optional]
 * TAG - describes all the properties of the file [optional]
 */
export interface IDescriptor {
    ID: string;
    version: number;
    descriptorBytes: number;
    headerBytes: number;
    seekTableBytes: number;
    headerDataBytes: number;
    apeFrameDataBytes: number;
    apeFrameDataBytesHigh: number;
    terminatingDataBytes: number;
    fileMD5: Uint8Array;
}
/**
 * APE_HEADER: describes all of the necessary information about the APE file
 */
export interface IHeader {
    compressionLevel: number;
    formatFlags: number;
    blocksPerFrame: number;
    finalFrameBlocks: number;
    totalFrames: number;
    bitsPerSample: number;
    channel: number;
    sampleRate: number;
}
export interface IFooter {
    ID: string;
    version: number;
    size: number;
    fields: number;
    flags: ITagFlags;
}
export declare enum DataType {
    text_utf8 = 0,
    binary = 1,
    external_info = 2,
    reserved = 3
}
/**
 * APE_DESCRIPTOR: defines the sizes (and offsets) of all the pieces, as well as the MD5 checksum
 */
export declare const DescriptorParser: IGetToken<IDescriptor>;
/**
 * APE_HEADER: describes all of the necessary information about the APE file
 */
export declare const Header: IGetToken<IHeader>;
/**
 * APE Tag Header/Footer Version 2.0
 * TAG: describes all the properties of the file [optional]
 */
export declare const TagFooter: IGetToken<IFooter>;
/**
 * APE Tag v2.0 Item Header
 */
export interface ITagItemHeader {
    size: number;
    flags: ITagFlags;
}
/**
 * APE Tag v2.0 Item Header
 */
export declare const TagItemHeader: IGetToken<ITagItemHeader>;
export declare const TagField: (footer: any) => Token.Uint8ArrayType;
export interface ITagFlags {
    containsHeader: boolean;
    containsFooter: boolean;
    isHeader: boolean;
    readOnly: boolean;
    dataType: DataType;
}
export declare function parseTagFlags(flags: any): ITagFlags;
/**
 * @param num {number}
 * @param bit 0 is least significant bit (LSB)
 * @return {boolean} true if bit is 1; otherwise false
 */
export declare function isBitSet(num: any, bit: any): boolean;
