import * as generic from './GenericTagTypes';
import { ITag } from '../type';
import { INativeMetadataCollector, IWarningCollector } from './MetadataCollector';
export interface IGenericTagMapper {
    /**
     * Which tagType it able to map to the generic mapping format
     */
    tagTypes: generic.TagType[];
    /**
     * Basic tag map
     */
    tagMap: generic.INativeTagMap;
    /**
     * Map native tag to generic tag
     * @param tag       Native tag
     * @param warnings  Register warnings
     * @return Generic tag, if native tag could be mapped
     */
    mapGenericTag(tag: ITag, warnings: INativeMetadataCollector): generic.IGenericTag;
}
export declare class CommonTagMapper implements IGenericTagMapper {
    tagTypes: generic.TagType[];
    tagMap: generic.INativeTagMap;
    static maxRatingScore: number;
    static toIntOrNull(str: string): number;
    static normalizeTrack(origVal: number | string): {
        no: number;
        of: number;
    };
    constructor(tagTypes: generic.TagType[], tagMap: generic.INativeTagMap);
    /**
     * Process and set common tags
     * write common tags to
     * @param tag Native tag
     * @param warnings Register warnings
     * @return common name
     */
    mapGenericTag(tag: ITag, warnings: IWarningCollector): generic.IGenericTag;
    /**
     * Convert native tag key to common tag key
     * @tag  Native header tag
     * @return common tag name (alias)
     */
    protected getCommonName(tag: string): generic.GenericTagId;
    /**
     * Handle post mapping exceptions / correction
     * @param tag Tag e.g. {"©alb", "Buena Vista Social Club")
     * @param warnings Used to register warnings
     */
    protected postMap(tag: ITag, warnings: IWarningCollector): void;
}
