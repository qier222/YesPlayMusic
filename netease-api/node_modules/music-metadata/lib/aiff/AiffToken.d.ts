/// <reference types="node" />
import { IGetToken } from 'strtok3';
import * as iff from '../iff';
/**
 * The Common Chunk.
 * Describes fundamental parameters of the waveform data such as sample rate, bit resolution, and how many channels of
 * digital audio are stored in the FORM AIFF.
 */
export interface ICommon {
    numChannels: number;
    numSampleFrames: number;
    sampleSize: number;
    sampleRate: number;
    compressionType?: string;
    compressionName?: string;
}
export declare class Common implements IGetToken<ICommon> {
    private isAifc;
    len: number;
    constructor(header: iff.IChunkHeader, isAifc: boolean);
    get(buf: Buffer, off: number): ICommon;
}
