/**
 * Extended Lame Header
 */
import { IGetToken } from 'strtok3/lib/core';
import { IReplayGain } from './ReplayGainDataFormat';
/**
 * LAME Tag, extends the Xing header format
 * First added in LAME 3.12 for VBR
 * The modified header is also included in CBR files (effective LAME 3.94), with "Info" instead of "XING" near the beginning.
 */
export interface IExtendedLameHeader {
    revision: number;
    vbr_method: number;
    lowpass_filter: number;
    track_peak?: number;
    track_gain: IReplayGain;
    album_gain: IReplayGain;
    music_length: number;
    music_crc: number;
    header_crc: number;
}
/**
 * Info Tag
 * @link http://gabriel.mp3-tech.org/mp3infotag.html
 * @link https://github.com/quodlibet/mutagen/blob/abd58ee58772224334a18817c3fb31103572f70e/mutagen/mp3/_util.py#L112
 */
export declare const ExtendedLameHeader: IGetToken<IExtendedLameHeader>;
