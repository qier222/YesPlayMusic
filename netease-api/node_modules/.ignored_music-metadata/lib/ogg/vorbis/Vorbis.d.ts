/// <reference types="node" />
import { IGetToken } from 'strtok3/lib/core';
import { IPicture } from '../../type';
/**
 * Interface to parsed result of METADATA_BLOCK_PICTURE
 * Ref: https://wiki.xiph.org/VorbisComment#METADATA_BLOCK_PICTURE
 * Ref: https://xiph.org/flac/format.html#metadata_block_picture
 */
export interface IVorbisPicture extends IPicture {
    type: string;
    description: string;
    width: number;
    height: number;
    colour_depth: number;
    indexed_color: number;
}
/**
 * Parse the METADATA_BLOCK_PICTURE
 * Ref: https://wiki.xiph.org/VorbisComment#METADATA_BLOCK_PICTURE
 * Ref: https://xiph.org/flac/format.html#metadata_block_picture
 * // ToDo: move to ID3 / APIC?
 */
export declare class VorbisPictureToken implements IGetToken<IVorbisPicture> {
    len: any;
    static fromBase64(base64str: string): IVorbisPicture;
    static fromBuffer(buffer: Buffer): IVorbisPicture;
    constructor(len: any);
    get(buffer: Buffer, offset: number): IVorbisPicture;
}
/**
 * Vorbis 1 decoding tokens
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-620004.2.1
 */
/**
 * Comment header interface
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-620004.2.1
 */
export interface ICommonHeader {
    /**
     * Packet Type
     */
    packetType: number;
    /**
     * Should be 'vorbis'
     */
    vorbis: string;
}
/**
 * Comment header decoder
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-620004.2.1
 */
export declare const CommonHeader: IGetToken<ICommonHeader>;
/**
 * Identification header interface
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-630004.2.2
 */
export interface IFormatInfo {
    version: number;
    channelMode: number;
    sampleRate: number;
    bitrateMax: number;
    bitrateNominal: number;
    bitrateMin: number;
}
/**
 * Identification header decoder
 * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-630004.2.2
 */
export declare const IdentificationHeader: IGetToken<IFormatInfo>;
