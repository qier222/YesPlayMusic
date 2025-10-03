/// <reference types="node" />
import { IGetToken } from 'strtok3/lib/core';
import { IChunkHeader } from '../iff';
/**
 * Ref: https://msdn.microsoft.com/en-us/library/windows/desktop/dd317599(v=vs.85).aspx
 */
export declare enum WaveFormat {
    PCM = 1,
    ADPCM = 2,
    IEEE_FLOAT = 3,
    MPEG_ADTS_AAC = 5632,
    MPEG_LOAS = 5634,
    RAW_AAC1 = 255,
    DOLBY_AC3_SPDIF = 146,
    DVM = 8192,
    RAW_SPORT = 576,
    ESST_AC3 = 577,
    DRM = 9,
    DTS2 = 8193,
    MPEG = 80
}
/**
 * "fmt"  sub-chunk describes the sound data's format
 * Ref: http://soundfile.sapp.org/doc/WaveFormat
 */
export interface IWaveFormat {
    /**
     * PCM = 1 (i.e. Linear quantization). Values other than 1 indicate some form of compression.
     */
    wFormatTag: WaveFormat;
    /**
     * Mono = 1, Stereo = 2, etc.
     */
    nChannels: number;
    /**
     * 8000, 44100, etc.
     */
    nSamplesPerSec: number;
    nAvgBytesPerSec: number;
    nBlockAlign: number;
    wBitsPerSample: number;
}
/**
 * format chunk; chunk-id is "fmt "
 * http://soundfile.sapp.org/doc/WaveFormat/
 */
export declare class Format implements IGetToken<IWaveFormat> {
    len: number;
    constructor(header: IChunkHeader);
    get(buf: Buffer, off: number): IWaveFormat;
}
export interface IFactChunk {
    dwSampleLength: number;
}
/**
 * Fact chunk; chunk-id is "fact"
 * http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
 * http://www.recordingblogs.com/wiki/fact-chunk-of-a-wave-file
 */
export declare class FactChunk implements IGetToken<IFactChunk> {
    len: number;
    constructor(header: IChunkHeader);
    get(buf: Buffer, off: number): IFactChunk;
}
