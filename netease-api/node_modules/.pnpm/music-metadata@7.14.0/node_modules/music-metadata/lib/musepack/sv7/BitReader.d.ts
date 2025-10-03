import { ITokenizer } from 'strtok3/lib/core';
export declare class BitReader {
    private tokenizer;
    pos: number;
    private dword;
    constructor(tokenizer: ITokenizer);
    /**
     *
     * @param bits 1..30 bits
     */
    read(bits: number): Promise<number>;
    ignore(bits: number): Promise<number>;
}
