import { IRatio } from '../type';
export type StringEncoding = 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64url' | 'latin1' | 'hex';
export interface ITextEncoding {
    encoding: StringEncoding;
    bom?: boolean;
}
export declare function getBit(buf: Uint8Array, off: number, bit: number): boolean;
/**
 * Found delimiting zero in uint8Array
 * @param uint8Array Uint8Array to find the zero delimiter in
 * @param start Offset in uint8Array
 * @param end Last position to parse in uint8Array
 * @param encoding The string encoding used
 * @return Absolute position on uint8Array where zero found
 */
export declare function findZero(uint8Array: Uint8Array, start: number, end: number, encoding?: StringEncoding): number;
export declare function trimRightNull(x: string): string;
/**
 * Decode string
 */
export declare function decodeString(uint8Array: Uint8Array, encoding: StringEncoding): string;
export declare function stripNulls(str: string): string;
/**
 * Read bit-aligned number start from buffer
 * Total offset in bits = byteOffset * 8 + bitOffset
 * @param source Byte buffer
 * @param byteOffset Starting offset in bytes
 * @param bitOffset Starting offset in bits: 0 = lsb
 * @param len Length of number in bits
 * @return Decoded bit aligned number
 */
export declare function getBitAllignedNumber(source: Uint8Array, byteOffset: number, bitOffset: number, len: number): number;
/**
 * Read bit-aligned number start from buffer
 * Total offset in bits = byteOffset * 8 + bitOffset
 * @param source Byte Uint8Array
 * @param byteOffset Starting offset in bytes
 * @param bitOffset Starting offset in bits: 0 = most significant bit, 7 is the least significant bit
 * @return True if bit is set
 */
export declare function isBitSet(source: Uint8Array, byteOffset: number, bitOffset: number): boolean;
export declare function a2hex(str: string): string;
/**
 * Convert power ratio to DB
 * ratio: [0..1]
 */
export declare function ratioToDb(ratio: number): number;
/**
 * Convert dB to ratio
 * db Decibels
 */
export declare function dbToRatio(dB: number): number;
/**
 * Convert replay gain to ratio and Decibel
 * @param value string holding a ratio like '0.034' or '-7.54 dB'
 */
export declare function toRatio(value: string): IRatio;
