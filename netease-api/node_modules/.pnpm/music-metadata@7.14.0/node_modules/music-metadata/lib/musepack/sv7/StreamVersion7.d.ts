import { IGetToken } from 'strtok3/lib/core';
/**
 * MusePack stream version 7 format specification
 * http://trac.musepack.net/musepack/wiki/SV7Specification
 */
export interface IHeader {
    signature: string;
    streamMinorVersion: number;
    streamMajorVersion: number;
    frameCount: number;
    intensityStereo: boolean;
    midSideStereo: boolean;
    maxBand: number;
    profile: number;
    link: number;
    sampleFrequency: number;
    maxLevel: number;
    titleGain: number;
    titlePeak: number;
    albumGain: number;
    albumPeak: number;
    trueGapless: boolean;
    lastFrameLength: number;
}
/**
 * BASIC STRUCTURE
 */
export declare const Header: IGetToken<IHeader>;
