/// <reference types="node" />
import { DataType } from './AsfObject';
export type AttributeParser = (buf: Buffer) => boolean | string | number | bigint | Buffer;
export declare class AsfUtil {
    static getParserForAttr(i: DataType): AttributeParser;
    static parseUnicodeAttr(uint8Array: Uint8Array): string;
    private static attributeParsers;
    private static parseByteArrayAttr;
    private static parseBoolAttr;
    private static parseDWordAttr;
    private static parseQWordAttr;
    private static parseWordAttr;
}
