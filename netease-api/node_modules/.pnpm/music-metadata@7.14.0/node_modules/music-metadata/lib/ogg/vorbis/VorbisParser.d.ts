/// <reference types="node" />
import { IOptions } from '../../type';
import { INativeMetadataCollector } from '../../common/MetadataCollector';
import * as Ogg from '../Ogg';
import { IVorbisPicture } from './Vorbis';
/**
 * Vorbis 1 Parser.
 * Used by OggParser
 */
export declare class VorbisParser implements Ogg.IPageConsumer {
    protected metadata: INativeMetadataCollector;
    protected options: IOptions;
    private pageSegments;
    constructor(metadata: INativeMetadataCollector, options: IOptions);
    /**
     * Vorbis 1 parser
     * @param header Ogg Page Header
     * @param pageData Page data
     */
    parsePage(header: Ogg.IPageHeader, pageData: Buffer): void;
    flush(): void;
    parseUserComment(pageData: Buffer, offset: number): number;
    addTag(id: string, value: string | IVorbisPicture): void;
    calculateDuration(header: Ogg.IPageHeader): void;
    /**
     * Parse first Ogg/Vorbis page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    protected parseFirstPage(header: Ogg.IPageHeader, pageData: Buffer): void;
    protected parseFullPage(pageData: Buffer): void;
    /**
     * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-840005.2
     */
    protected parseUserCommentList(pageData: Buffer, offset: number): void;
}
