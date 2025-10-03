import { BasicParser } from '../../common/BasicParser';
export declare class MpcSv8Parser extends BasicParser {
    private audioLength;
    parse(): Promise<void>;
    private parsePacket;
}
