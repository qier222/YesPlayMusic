/// <reference types="node" />
/// <reference types="node" />
import { Writable } from "stream";
import { StringEncoding } from "./StringEncoding";
export declare class StringWriter extends Writable {
    protected buf: Buffer;
    _write(chunk: Buffer | string | any, _: string, callback: (error: Error | null) => void): void;
    getText(encoding: StringEncoding): string;
}
