import { IGetToken } from 'strtok3/lib/core';
export interface IBroadcastAudioExtensionChunk {
    description: string;
    originator: string;
    originatorReference: string;
    originationDate: string;
    originationTime: string;
    timeReferenceLow: number;
    timeReferenceHigh: number;
    version: number;
    umid: Uint8Array;
}
/**
 * Broadcast Audio Extension Chunk
 * Ref: https://tech.ebu.ch/docs/tech/tech3285.pdf
 */
export declare const BroadcastAudioExtensionChunk: IGetToken<IBroadcastAudioExtensionChunk>;
