import { CaseInsensitiveTagMap } from '../common/CaseInsensitiveTagMap';
import { ITag } from "../type";
import { INativeMetadataCollector } from "../common/MetadataCollector";
export declare const tagType = "iTunes";
export declare class MP4TagMapper extends CaseInsensitiveTagMap {
    constructor();
    protected postMap(tag: ITag, warnings: INativeMetadataCollector): void;
}
