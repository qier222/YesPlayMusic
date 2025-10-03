import { INativeTagMap, TagType } from './GenericTagTypes';
import { CommonTagMapper } from './GenericTagMapper';
export declare class CaseInsensitiveTagMap extends CommonTagMapper {
    constructor(tagTypes: TagType[], tagMap: INativeTagMap);
    /**
     * @tag  Native header tag
     * @return common tag name (alias)
     */
    protected getCommonName(tag: string): import("./GenericTagTypes").GenericTagId;
}
