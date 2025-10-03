import { INativeTagMap } from '../common/GenericTagTypes';
import { CommonTagMapper } from '../common/GenericTagMapper';
/**
 * RIFF Info Tags; part of the EXIF 2.3
 * Ref: http://owl.phy.queensu.ca/~phil/exiftool/TagNames/RIFF.html#Info
 */
export declare const riffInfoTagMap: INativeTagMap;
export declare class RiffInfoTagMapper extends CommonTagMapper {
    constructor();
}
