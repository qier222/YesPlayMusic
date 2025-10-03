import { IGetToken } from 'strtok3/lib/core';
export interface IReplayGain {
    type: NameCode;
    origin: ReplayGainOriginator;
    adjustment: number;
}
/**
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format#name-code
 */
declare enum NameCode {
    /**
     * not set
     */
    not_set = 0,
    /**
     * Radio Gain Adjustment
     */
    radio = 1,
    /**
     * Audiophile Gain Adjustment
     */
    audiophile = 2
}
/**
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format#originator-code
 */
declare enum ReplayGainOriginator {
    /**
     * Replay Gain unspecified
     */
    unspecified = 0,
    /**
     * Replay Gain pre-set by artist/producer/mastering engineer
     */
    engineer = 1,
    /**
     * Replay Gain set by user
     */
    user = 2,
    /**
     * Replay Gain determined automatically, as described on this site
     */
    automatic = 3,
    /**
     * Set by simple RMS average
     */
    rms_average = 4
}
/**
 * Replay Gain Data Format
 *
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format
 */
export declare const ReplayGain: IGetToken<IReplayGain>;
export {};
