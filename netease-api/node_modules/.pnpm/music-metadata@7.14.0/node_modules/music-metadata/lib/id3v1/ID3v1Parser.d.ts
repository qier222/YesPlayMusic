import { BasicParser } from '../common/BasicParser';
import { IRandomReader } from '../type';
/**
 * ID3v1 Genre mappings
 * Ref: https://de.wikipedia.org/wiki/Liste_der_ID3v1-Genres
 */
export declare const Genres: string[];
export declare class ID3v1Parser extends BasicParser {
    private static getGenre;
    parse(): Promise<void>;
    private addTag;
}
export declare function hasID3v1Header(reader: IRandomReader): Promise<boolean>;
