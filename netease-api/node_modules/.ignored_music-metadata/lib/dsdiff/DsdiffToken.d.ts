import { IGetToken } from 'strtok3/lib/core';
import { IChunkHeader64 } from '../iff';
export { IChunkHeader64 } from '../iff';
/**
 * DSDIFF chunk header
 * The data-size encoding is deviating from EA-IFF 85
 * Ref: http://www.sonicstudio.com/pdf/dsd/DSDIFF_1.5_Spec.pdf
 */
export declare const ChunkHeader64: IGetToken<IChunkHeader64>;
