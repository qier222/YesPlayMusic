"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpcSv8Parser = void 0;
const debug_1 = require("debug");
const BasicParser_1 = require("../../common/BasicParser");
const APEv2Parser_1 = require("../../apev2/APEv2Parser");
const FourCC_1 = require("../../common/FourCC");
const SV8 = require("./StreamVersion8");
const debug = (0, debug_1.default)('music-metadata:parser:musepack');
class MpcSv8Parser extends BasicParser_1.BasicParser {
    constructor() {
        super(...arguments);
        this.audioLength = 0;
    }
    async parse() {
        const signature = await this.tokenizer.readToken(FourCC_1.FourCcToken);
        if (signature !== 'MPCK')
            throw new Error('Invalid Magic number');
        this.metadata.setFormat('container', 'Musepack, SV8');
        return this.parsePacket();
    }
    async parsePacket() {
        const sv8reader = new SV8.StreamReader(this.tokenizer);
        do {
            const header = await sv8reader.readPacketHeader();
            debug(`packet-header key=${header.key}, payloadLength=${header.payloadLength}`);
            switch (header.key) {
                case 'SH': // Stream Header
                    const sh = await sv8reader.readStreamHeader(header.payloadLength);
                    this.metadata.setFormat('numberOfSamples', sh.sampleCount);
                    this.metadata.setFormat('sampleRate', sh.sampleFrequency);
                    this.metadata.setFormat('duration', sh.sampleCount / sh.sampleFrequency);
                    this.metadata.setFormat('numberOfChannels', sh.channelCount);
                    break;
                case 'AP': // Audio Packet
                    this.audioLength += header.payloadLength;
                    await this.tokenizer.ignore(header.payloadLength);
                    break;
                case 'RG': // Replaygain
                case 'EI': // Encoder Info
                case 'SO': // Seek Table Offset
                case 'ST': // Seek Table
                case 'CT': // Chapter-Tag
                    await this.tokenizer.ignore(header.payloadLength);
                    break;
                case 'SE': // Stream End
                    this.metadata.setFormat('bitrate', this.audioLength * 8 / this.metadata.format.duration);
                    return APEv2Parser_1.APEv2Parser.tryParseApeHeader(this.metadata, this.tokenizer, this.options);
                default:
                    throw new Error(`Unexpected header: ${header.key}`);
            }
        } while (true);
    }
}
exports.MpcSv8Parser = MpcSv8Parser;
