import { FormatId, IAudioMetadata, ICommonTagsResult, IFormat, INativeTags, IOptions, IQualityInformation, ITrackInfo } from '../type';
import { IGenericTag, TagType } from './GenericTagTypes';
/**
 * Combines all generic-tag-mappers for each tag type
 */
export interface IWarningCollector {
    /**
     * Register parser warning
     * @param warning
     */
    addWarning(warning: string): any;
}
export interface INativeMetadataCollector extends IWarningCollector {
    /**
     * Only use this for reading
     */
    readonly format: IFormat;
    readonly native: INativeTags;
    readonly quality: IQualityInformation;
    /**
     * @returns {boolean} true if one or more tags have been found
     */
    hasAny(): boolean;
    setFormat(key: FormatId, value: any): void;
    addTag(tagType: TagType, tagId: string, value: any): void;
    addStreamInfo(streamInfo: ITrackInfo): void;
}
/**
 * Provided to the parser to uodate the metadata result.
 * Responsible for triggering async updates
 */
export declare class MetadataCollector implements INativeMetadataCollector {
    private opts;
    readonly format: IFormat;
    readonly native: INativeTags;
    readonly common: ICommonTagsResult;
    readonly quality: IQualityInformation;
    /**
     * Keeps track of origin priority for each mapped id
     */
    private readonly commonOrigin;
    /**
     * Maps a tag type to a priority
     */
    private readonly originPriority;
    private tagMapper;
    constructor(opts: IOptions);
    /**
     * @returns {boolean} true if one or more tags have been found
     */
    hasAny(): boolean;
    addStreamInfo(streamInfo: ITrackInfo): void;
    setFormat(key: FormatId, value: any): void;
    addTag(tagType: TagType, tagId: string, value: any): void;
    addWarning(warning: string): void;
    postMap(tagType: TagType | 'artificial', tag: IGenericTag): any;
    /**
     * Convert native tags to common tags
     * @returns {IAudioMetadata} Native + common tags
     */
    toCommonMetadata(): IAudioMetadata;
    /**
     * Fix some common issues with picture object
     * @param picture Picture
     */
    private postFixPicture;
    /**
     * Convert native tag to common tags
     */
    private toCommon;
    /**
     * Set generic tag
     */
    private setGenericTag;
}
export declare function joinArtists(artists: string[]): string;
