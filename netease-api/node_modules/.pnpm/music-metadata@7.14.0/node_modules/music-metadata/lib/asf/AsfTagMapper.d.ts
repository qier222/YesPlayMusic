import { CommonTagMapper } from '../common/GenericTagMapper';
import { IRating, ITag } from '../type';
export declare class AsfTagMapper extends CommonTagMapper {
    static toRating(rating: string): IRating;
    constructor();
    protected postMap(tag: ITag): void;
}
