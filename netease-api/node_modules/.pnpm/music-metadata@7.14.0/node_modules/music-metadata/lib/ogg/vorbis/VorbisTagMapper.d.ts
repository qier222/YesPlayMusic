import { CommonTagMapper } from '../../common/GenericTagMapper';
import { IRating, ITag } from '../../type';
export declare class VorbisTagMapper extends CommonTagMapper {
    static toRating(email: string, rating: string, maxScore: number): IRating;
    constructor();
    protected postMap(tag: ITag): void;
}
