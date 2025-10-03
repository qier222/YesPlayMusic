import { IGenericTag, TagType } from './GenericTagTypes';
import { IGenericTagMapper } from './GenericTagMapper';
import { ITag } from '../type';
import { INativeMetadataCollector } from './MetadataCollector';
export declare class CombinedTagMapper {
    tagMappers: {
        [index: string]: IGenericTagMapper;
    };
    constructor();
    /**
     * Convert native to generic (common) tags
     * @param tagType Originating tag format
     * @param tag     Native tag to map to a generic tag id
     * @param warnings
     * @return Generic tag result (output of this function)
     */
    mapTag(tagType: TagType, tag: ITag, warnings: INativeMetadataCollector): IGenericTag;
    private registerTagMapper;
}
