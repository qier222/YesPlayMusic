/// <reference types="node" />
import * as Token from 'token-types';
import { IGetToken, ITokenizer } from 'strtok3/lib/core';
import { IExtendedLameHeader } from './ExtendedLameHeader';
export interface IXingHeaderFlags {
    frames: boolean;
    bytes: boolean;
    toc: boolean;
    vbrScale: boolean;
}
/**
 * Info Tag: Xing, LAME
 */
export declare const InfoTagHeaderTag: Token.StringType;
/**
 * LAME TAG value
 * Did not find any official documentation for this
 * Value e.g.: "3.98.4"
 */
export declare const LameEncoderVersion: Token.StringType;
export interface IXingInfoTag {
    /**
     * total bit stream frames from Vbr header data
     */
    numFrames?: number;
    /**
     * Actual stream size = file size - header(s) size [bytes]
     */
    streamSize?: number;
    toc?: Buffer;
    /**
     * the number of header data bytes (from original file)
     */
    vbrScale?: number;
    lame?: {
        version: string;
        extended?: IExtendedLameHeader;
    };
}
/**
 * Info Tag
 * Ref: http://gabriel.mp3-tech.org/mp3infotag.html
 */
export declare const XingHeaderFlags: IGetToken<IXingHeaderFlags>;
export declare function readXingHeader(tokenizer: ITokenizer): Promise<IXingInfoTag>;
