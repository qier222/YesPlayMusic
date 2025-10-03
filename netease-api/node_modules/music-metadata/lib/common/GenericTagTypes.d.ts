export type TagType = 'vorbis' | 'ID3v1' | 'ID3v2.2' | 'ID3v2.3' | 'ID3v2.4' | 'APEv2' | 'asf' | 'iTunes' | 'exif' | 'matroska' | 'AIFF';
export interface IGenericTag {
    id: GenericTagId;
    value: any;
}
export type GenericTagId = 'track' | 'disk' | 'year' | 'title' | 'artist' | 'artists' | 'albumartist' | 'album' | 'date' | 'originaldate' | 'originalyear' | 'comment' | 'genre' | 'picture' | 'composer' | 'lyrics' | 'albumsort' | 'titlesort' | 'work' | 'artistsort' | 'albumartistsort' | 'composersort' | 'lyricist' | 'writer' | 'conductor' | 'remixer' | 'arranger' | 'engineer' | 'technician' | 'producer' | 'djmixer' | 'mixer' | 'publisher' | 'label' | 'grouping' | 'subtitle' | 'discsubtitle' | 'totaltracks' | 'totaldiscs' | 'compilation' | 'rating' | 'bpm' | 'mood' | 'media' | 'catalognumber' | 'tvShow' | 'tvShowSort' | 'tvEpisode' | 'tvEpisodeId' | 'tvNetwork' | 'tvSeason' | 'podcast' | 'podcasturl' | 'releasestatus' | 'releasetype' | 'releasecountry' | 'script' | 'language' | 'copyright' | 'license' | 'encodedby' | 'encodersettings' | 'gapless' | 'barcode' | 'isrc' | 'asin' | 'musicbrainz_recordingid' | 'musicbrainz_trackid' | 'musicbrainz_albumid' | 'musicbrainz_artistid' | 'musicbrainz_albumartistid' | 'musicbrainz_releasegroupid' | 'musicbrainz_workid' | 'musicbrainz_trmid' | 'musicbrainz_discid' | 'acoustid_id' | 'acoustid_fingerprint' | 'musicip_puid' | 'musicip_fingerprint' | 'website' | 'performer:instrument' | 'peakLevel' | 'averageLevel' | 'notes' | 'key' | 'originalalbum' | 'originalartist' | 'discogs_artist_id' | 'discogs_label_id' | 'discogs_master_release_id' | 'discogs_rating' | 'discogs_release_id' | 'discogs_votes' | 'replaygain_track_gain' | 'replaygain_track_peak' | 'replaygain_album_gain' | 'replaygain_album_peak' | 'replaygain_track_minmax' | 'replaygain_album_minmax' | 'replaygain_undo' | 'description' | 'longDescription' | 'category' | 'hdVideo' | 'keywords' | 'movement' | 'movementIndex' | 'movementTotal' | 'podcastId' | 'showMovement' | 'stik';
export interface INativeTagMap {
    [index: string]: GenericTagId;
}
export interface ITagInfo {
    /**
     * True if result is an array
     */
    multiple: boolean;
    /**
     * True if the result is an array and each value in the array should be unique
     */
    unique?: boolean;
}
export interface ITagInfoMap {
    [index: string]: ITagInfo;
}
export declare const commonTags: ITagInfoMap;
/**
 * @param alias Name of common tag
 * @returns {boolean|*} true if given alias is mapped as a singleton', otherwise false
 */
export declare function isSingleton(alias: GenericTagId): boolean;
/**
 * @param alias Common (generic) tag
 * @returns {boolean|*} true if given alias is a singleton or explicitly marked as unique
 */
export declare function isUnique(alias: GenericTagId): boolean;
