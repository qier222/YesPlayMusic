/// <reference types="node" />
import { IToken, IGetToken } from 'strtok3/lib/core';
interface IVersionAndFlags {
    /**
     * A 1-byte specification of the version
     */
    version: number;
    /**
     * Three bytes of space for (future) flags.
     */
    flags: number;
}
export interface IAtomHeader {
    length: bigint;
    name: string;
}
export interface IAtomFtyp {
    type: string;
}
/**
 * Common interface for the mvhd (Movie Header) & mdhd (Media) atom
 */
export interface IAtomMxhd extends IVersionAndFlags {
    /**
     * A 32-bit integer that specifies (in seconds since midnight, January 1, 1904) when the media atom was created.
     * It is strongly recommended that this value should be specified using coordinated universal time (UTC).
     */
    creationTime: Date;
    /**
     * A 32-bit integer that specifies (in seconds since midnight, January 1, 1904) when the media atom was changed.
     * It is strongly recommended that this value should be specified using coordinated universal time (UTC).
     */
    modificationTime: Date;
    /**
     * A time value that indicates the time scale for this media—that is, the number of time units that pass per second in its time coordinate system.
     */
    timeScale: number;
    /**
     * Duration: the duration of this media in units of its time scale.
     */
    duration: number;
}
/**
 * Interface for the parsed Movie Header Atom (mvhd)
 */
export interface IAtomMvhd extends IAtomMxhd {
    /**
     * Preferred rate: a 32-bit fixed-point number that specifies the rate at which to play this movie.
     * A value of 1.0 indicates normal rate.
     */
    preferredRate: number;
    /**
     * Preferred volume: A 16-bit fixed-point number that specifies how loud to play this movie’s sound.
     * A value of 1.0 indicates full volume.
     */
    preferredVolume: number;
    /**
     * Reserved: Ten bytes reserved for use by Apple. Set to 0.
     */
    /**
     * Matrix structure: The matrix structure associated with this movie.
     * A matrix shows how to map points from one coordinate space into another.
     * See Matrices for a discussion of how display matrices are used in QuickTime.
     */
    /**
     * Preview time: The time value in the movie at which the preview begins.
     */
    previewTime: number;
    /**
     * Preview duration: The duration of the movie preview in movie time scale units.
     */
    previewDuration: number;
    /**
     * Poster time: The time value of the time of the movie poster.
     */
    posterTime: number;
    /**
     * selection time: The time value for the start time of the current selection.
     */
    selectionTime: number;
    /**
     * Selection duration:  The duration of the current selection in movie time scale units.
     */
    selectionDuration: number;
    /**
     * Current time:  The time value for current time position within the movie.
     */
    currentTime: number;
    /**
     * Next track ID:  A 32-bit integer that indicates a value to use for the track ID number of the next track added to this movie. Note that 0 is not a valid track ID value.
     */
    nextTrackID: number;
}
/**
 * Interface for the metadata header atom: 'mhdr'
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW13
 */
export interface IMovieHeaderAtom extends IVersionAndFlags {
    /**
     * A 32-bit unsigned integer indicating the value to use for the item ID of the next item created or assigned an item ID.
     * If the value is all ones, it indicates that future additions will require a search for an unused item ID.
     */
    nextItemID: number;
}
export declare const Header: IToken<IAtomHeader>;
/**
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap1/qtff1.html#//apple_ref/doc/uid/TP40000939-CH203-38190
 */
export declare const ExtendedSize: IToken<bigint>;
export declare const ftyp: IGetToken<IAtomFtyp>;
export declare const tkhd: IGetToken<IAtomFtyp>;
/**
 * Token: Movie Header Atom
 */
export declare const mhdr: IGetToken<IMovieHeaderAtom>;
/**
 * Base class for 'fixed' length atoms.
 * In some cases these atoms are longer then the sum of the described fields.
 * Issue: https://github.com/Borewit/music-metadata/issues/120
 */
export declare abstract class FixedLengthAtom {
    len: number;
    /**
     *
     * @param {number} len Length as specified in the size field
     * @param {number} expLen Total length of sum of specified fields in the standard
     */
    protected constructor(len: number, expLen: number, atomId: string);
}
/**
 * Interface for the parsed Movie Header Atom (mdhd)
 */
export interface IAtomMdhd extends IAtomMxhd {
    /**
     * A 16-bit integer that specifies the language code for this media.
     * See Language Code Values for valid language codes.
     * Also see Extended Language Tag Atom for the preferred code to use here if an extended language tag is also included in the media atom.
     * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap4/qtff4.html#//apple_ref/doc/uid/TP40000939-CH206-34353
     */
    language: number;
    quality: number;
}
/**
 * Token: Media Header Atom
 * Ref:
 * - https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-SW34
 * - https://wiki.multimedia.cx/index.php/QuickTime_container#mdhd
 */
export declare class MdhdAtom extends FixedLengthAtom implements IGetToken<IAtomMdhd> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): IAtomMdhd;
}
/**
 * Token: Movie Header Atom
 */
export declare class MvhdAtom extends FixedLengthAtom implements IGetToken<IAtomMvhd> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): IAtomMvhd;
}
/**
 * Data Atom Structure ('data')
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW32
 */
export interface IDataAtom {
    /**
     * Type Indicator
     * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW28
     */
    type: {
        /**
         * The set of types from which the type is drawn
         * If 0, type is drawn from the well-known set of types.
         */
        set: number;
        type: number;
    };
    /**
     * Locale Indicator
     */
    locale: number;
    /**
     * An array of bytes containing the value of the metadata.
     */
    value: Buffer;
}
/**
 * Data Atom Structure
 */
export declare class DataAtom implements IGetToken<IDataAtom> {
    len: number;
    constructor(len: number);
    get(buf: Uint8Array, off: number): IDataAtom;
}
/**
 * Data Atom Structure ('data')
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW32
 */
export interface INameAtom extends IVersionAndFlags {
    /**
     * An array of bytes containing the value of the metadata.
     */
    name: string;
}
/**
 * Data Atom Structure
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW31
 */
export declare class NameAtom implements IGetToken<INameAtom> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): INameAtom;
}
/**
 * Track Header Atoms interface
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25550
 */
export interface ITrackHeaderAtom extends IVersionAndFlags {
    /**
     * Creation Time
     */
    creationTime: Date;
    /**
     * Modification Time
     */
    modificationTime: Date;
    /**
     * TrackID
     */
    trackId: number;
    /**
     * A time value that indicates the duration of this track (in the movie’s time coordinate system).
     * Note that this property is derived from the track’s edits. The value of this field is equal to the sum of the
     * durations of all of the track’s edits. If there is no edit list, then the duration is the sum of the sample
     * durations, converted into the movie timescale.
     */
    duration: number;
    /**
     * A 16-bit integer that indicates this track’s spatial priority in its movie.
     * The QuickTime Movie Toolbox uses this value to determine how tracks overlay one another.
     * Tracks with lower layer values are displayed in front of tracks with higher layer values.
     */
    layer: number;
    /**
     * A 16-bit integer that identifies a collection of movie tracks that contain alternate data for one another.
     * This same identifier appears in each 'tkhd' atom of the other tracks in the group.
     * QuickTime chooses one track from the group to be used when the movie is played.
     * The choice may be based on such considerations as playback quality, language, or the capabilities of the computer.
     * A value of zero indicates that the track is not in an alternate track group.
     */
    alternateGroup: number;
    /**
     * A 16-bit fixed-point value that indicates how loudly this track’s sound is to be played.
     * A value of 1.0 indicates normal volume.
     */
    volume: number;
}
/**
 * Track Header Atoms structure
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25550
 */
export declare class TrackHeaderAtom implements IGetToken<ITrackHeaderAtom> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): ITrackHeaderAtom;
}
/**
 * Atom: Sample Description Atom ('stsd')
 */
interface IAtomStsdHeader extends IVersionAndFlags {
    numberOfEntries: number;
}
/**
 * Atom: Sample Description Atom ('stsd')
 */
export interface ISampleDescription {
    dataFormat: string;
    dataReferenceIndex: number;
    description: Uint8Array;
}
export interface IAtomStsd {
    header: IAtomStsdHeader;
    table: ISampleDescription[];
}
/**
 * Atom: Sample-description Atom ('stsd')
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
 */
export declare class StsdAtom implements IGetToken<IAtomStsd> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): IAtomStsd;
}
export interface ISoundSampleDescriptionVersion {
    version: number;
    revision: number;
    vendor: number;
}
/**
 * Common Sound Sample Description (version & revision)
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-57317
 */
export declare const SoundSampleDescriptionVersion: IGetToken<ISoundSampleDescriptionVersion>;
export interface ISoundSampleDescriptionV0 {
    numAudioChannels: number;
    /**
     * Number of bits in each uncompressed sound sample
     */
    sampleSize: number;
    /**
     * Compression ID
     */
    compressionId: number;
    packetSize: number;
    sampleRate: number;
}
/**
 * Sound Sample Description (Version 0)
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-130736
 */
export declare const SoundSampleDescriptionV0: IGetToken<ISoundSampleDescriptionV0>;
export interface ITableAtom<T> extends IVersionAndFlags {
    numberOfEntries: number;
    entries: T[];
}
declare class SimpleTableAtom<T> implements IGetToken<ITableAtom<T>> {
    len: number;
    private token;
    constructor(len: number, token: IGetToken<T>);
    get(buf: Buffer, off: number): ITableAtom<T>;
}
export interface ITimeToSampleToken {
    count: number;
    duration: number;
}
export declare const TimeToSampleToken: IGetToken<ITimeToSampleToken>;
/**
 * Time-to-sample('stts') atom.
 * Store duration information for a media’s samples.
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25696
 */
export declare class SttsAtom extends SimpleTableAtom<ITimeToSampleToken> {
    len: number;
    constructor(len: number);
}
/**
 * Sample-to-Chunk ('stsc') atom table entry interface
 */
export interface ISampleToChunk {
    firstChunk: number;
    samplesPerChunk: number;
    sampleDescriptionId: number;
}
export declare const SampleToChunkToken: IGetToken<ISampleToChunk>;
/**
 * Sample-to-Chunk ('stsc') atom interface
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25706
 */
export declare class StscAtom extends SimpleTableAtom<ISampleToChunk> {
    len: number;
    constructor(len: number);
}
/**
 * Sample-size ('stsz') atom interface
 */
export interface IStszAtom extends ITableAtom<number> {
    sampleSize: number;
}
/**
 * Sample-size ('stsz') atom
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25710
 */
export declare class StszAtom implements IGetToken<IStszAtom> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): IStszAtom;
}
/**
 * Chunk offset atom, 'stco'
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25715
 */
export declare class StcoAtom extends SimpleTableAtom<number> {
    len: number;
    constructor(len: number);
}
/**
 * Token used to decode text-track from 'mdat' atom (raw data stream)
 */
export declare class ChapterText implements IGetToken<string> {
    len: number;
    constructor(len: number);
    get(buf: Buffer, off: number): string;
}
export {};
