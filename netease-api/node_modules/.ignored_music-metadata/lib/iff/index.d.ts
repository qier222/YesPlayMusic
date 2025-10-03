import { IGetToken } from 'strtok3/lib/core';
/**
 * "EA IFF 85" Standard for Interchange Format Files
 * Ref: http://www.martinreddy.net/gfx/2d/IFF.txt
 */
export interface IChunkHeader {
    /**
     * A chunk ID (ie, 4 ASCII bytes)
     */
    chunkID: string;
    /**
     * Number of data bytes following this data header
     */
    chunkSize: number;
}
/**
 * "EA IFF 85" Standard for Interchange Format Files
 * Ref: http://www.martinreddy.net/gfx/2d/IFF.txt
 */
export interface IChunkHeader64 {
    /**
     * A chunk ID (ie, 4 ASCII bytes)
     */
    chunkID: string;
    /**
     * Number of data bytes following this data header
     */
    chunkSize: bigint;
}
/**
 * Common AIFF chunk header
 */
export declare const Header: IGetToken<IChunkHeader>;
