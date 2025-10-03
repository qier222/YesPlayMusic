import { IGetToken } from 'strtok3/lib/core';
/**
 * WavPack Block Header
 *
 * 32-byte little-endian header at the front of every WavPack block
 *
 * Ref:
 * - http://www.wavpack.com/WavPack5FileFormat.pdf (page 2/6: 2.0 "Block Header")
 */
export interface IBlockHeader {
    BlockID: string;
    blockSize: number;
    version: number;
    blockIndex: number;
    totalSamples: number;
    blockSamples: number;
    flags: {
        bitsPerSample: number;
        isMono: boolean;
        isHybrid: boolean;
        isJointStereo: boolean;
        crossChannel: boolean;
        hybridNoiseShaping: boolean;
        floatingPoint: boolean;
        samplingRate: number;
        isDSD: boolean;
    };
    crc: Uint8Array;
}
export interface IMetadataId {
    /**
     * metadata function id
     */
    functionId: number;
    /**
     * If true, audio-decoder does not need to understand the metadata field
     */
    isOptional: boolean;
    /**
     * actual data byte length is 1 less
     */
    isOddSize: boolean;
    /**
     * large block (> 255 words)
     */
    largeBlock: boolean;
}
export declare class WavPack {
    /**
     * WavPack Block Header
     *
     * 32-byte little-endian header at the front of every WavPack block
     *
     * Ref: http://www.wavpack.com/WavPack5FileFormat.pdf (page 2/6: 2.0 "Block Header")
     */
    static BlockHeaderToken: IGetToken<IBlockHeader>;
    /**
     * 3.0 Metadata Sub-Blocks
     * Ref: http://www.wavpack.com/WavPack5FileFormat.pdf (page 4/6: 3.0 "Metadata Sub-Block")
     */
    static MetadataIdToken: IGetToken<IMetadataId>;
    private static isBitSet;
    private static getBitAllignedNumber;
}
