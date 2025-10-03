import { BasicParser } from '../../common/BasicParser';
export declare class MpcSv7Parser extends BasicParser {
    private bitreader;
    private audioLength;
    private duration;
    parse(): Promise<void>;
    private skipAudioData;
}
