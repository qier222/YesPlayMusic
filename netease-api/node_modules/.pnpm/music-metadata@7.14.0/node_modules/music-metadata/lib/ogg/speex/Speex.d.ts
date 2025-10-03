import { IGetToken } from 'strtok3/lib/core';
/**
 * Speex Header Packet
 * Ref: https://www.speex.org/docs/manual/speex-manual/node8.html#SECTION00830000000000000000
 */
export interface IHeader {
    /**
     * speex_string, char[] 8
     */
    speex: string;
    /**
     * speex_version, char[] 20
     */
    version: string;
    /**
     * Version id
     */
    version_id: number;
    header_size: number;
    rate: number;
    mode: number;
    mode_bitstream_version: number;
    nb_channels: number;
    bitrate: number;
    frame_size: number;
    vbr: number;
    frames_per_packet: number;
    extra_headers: number;
    reserved1: number;
    reserved2: number;
}
/**
 * Speex Header Packet
 * Ref: https://www.speex.org/docs/manual/speex-manual/node8.html#SECTION00830000000000000000
 */
export declare const Header: IGetToken<IHeader>;
