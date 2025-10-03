"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatroskaParser = void 0;
const token_types_1 = require("token-types");
const debug_1 = require("debug");
const BasicParser_1 = require("../common/BasicParser");
const types_1 = require("./types");
const matroskaDtd = require("./MatroskaDtd");
const debug = (0, debug_1.default)('music-metadata:parser:matroska');
/**
 * Extensible Binary Meta Language (EBML) parser
 * https://en.wikipedia.org/wiki/Extensible_Binary_Meta_Language
 * http://matroska.sourceforge.net/technical/specs/rfc/index.html
 *
 * WEBM VP8 AUDIO FILE
 */
class MatroskaParser extends BasicParser_1.BasicParser {
    constructor() {
        super();
        this.padding = 0;
        this.parserMap = new Map();
        this.ebmlMaxIDLength = 4;
        this.ebmlMaxSizeLength = 8;
        this.parserMap.set(types_1.DataType.uint, e => this.readUint(e));
        this.parserMap.set(types_1.DataType.string, e => this.readString(e));
        this.parserMap.set(types_1.DataType.binary, e => this.readBuffer(e));
        this.parserMap.set(types_1.DataType.uid, async (e) => await this.readUint(e) === 1);
        this.parserMap.set(types_1.DataType.bool, e => this.readFlag(e));
        this.parserMap.set(types_1.DataType.float, e => this.readFloat(e));
    }
    /**
     * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
     * @param {INativeMetadataCollector} metadata Output
     * @param {ITokenizer} tokenizer Input
     * @param {IOptions} options Parsing options
     */
    init(metadata, tokenizer, options) {
        super.init(metadata, tokenizer, options);
        return this;
    }
    async parse() {
        const matroska = await this.parseContainer(matroskaDtd.elements, this.tokenizer.fileInfo.size, []);
        this.metadata.setFormat('container', `EBML/${matroska.ebml.docType}`);
        if (matroska.segment) {
            const info = matroska.segment.info;
            if (info) {
                const timecodeScale = info.timecodeScale ? info.timecodeScale : 1000000;
                if (typeof info.duration === 'number') {
                    const duration = info.duration * timecodeScale / 1000000000;
                    this.addTag('segment:title', info.title);
                    this.metadata.setFormat('duration', duration);
                }
            }
            const audioTracks = matroska.segment.tracks;
            if (audioTracks && audioTracks.entries) {
                audioTracks.entries.forEach(entry => {
                    const stream = {
                        codecName: entry.codecID.replace('A_', '').replace('V_', ''),
                        codecSettings: entry.codecSettings,
                        flagDefault: entry.flagDefault,
                        flagLacing: entry.flagLacing,
                        flagEnabled: entry.flagEnabled,
                        language: entry.language,
                        name: entry.name,
                        type: entry.trackType,
                        audio: entry.audio,
                        video: entry.video
                    };
                    this.metadata.addStreamInfo(stream);
                });
                const audioTrack = audioTracks.entries
                    .filter(entry => {
                    return entry.trackType === types_1.TrackType.audio.valueOf();
                })
                    .reduce((acc, cur) => {
                    if (!acc) {
                        return cur;
                    }
                    if (!acc.flagDefault && cur.flagDefault) {
                        return cur;
                    }
                    if (cur.trackNumber && cur.trackNumber < acc.trackNumber) {
                        return cur;
                    }
                    return acc;
                }, null);
                if (audioTrack) {
                    this.metadata.setFormat('codec', audioTrack.codecID.replace('A_', ''));
                    this.metadata.setFormat('sampleRate', audioTrack.audio.samplingFrequency);
                    this.metadata.setFormat('numberOfChannels', audioTrack.audio.channels);
                }
                if (matroska.segment.tags) {
                    matroska.segment.tags.tag.forEach(tag => {
                        const target = tag.target;
                        const targetType = (target === null || target === void 0 ? void 0 : target.targetTypeValue) ? types_1.TargetType[target.targetTypeValue] : ((target === null || target === void 0 ? void 0 : target.targetType) ? target.targetType : 'track');
                        tag.simpleTags.forEach(simpleTag => {
                            const value = simpleTag.string ? simpleTag.string : simpleTag.binary;
                            this.addTag(`${targetType}:${simpleTag.name}`, value);
                        });
                    });
                }
                if (matroska.segment.attachments) {
                    matroska.segment.attachments.attachedFiles
                        .filter(file => file.mimeType.startsWith('image/'))
                        .map(file => {
                        return {
                            data: file.data,
                            format: file.mimeType,
                            description: file.description,
                            name: file.name
                        };
                    }).forEach(picture => {
                        this.addTag('picture', picture);
                    });
                }
            }
        }
    }
    async parseContainer(container, posDone, path) {
        const tree = {};
        while (this.tokenizer.position < posDone) {
            let element;
            try {
                element = await this.readElement();
            }
            catch (error) {
                if (error.message === 'End-Of-Stream') {
                    break;
                }
                throw error;
            }
            const type = container[element.id];
            if (type) {
                debug(`Element: name=${type.name}, container=${!!type.container}`);
                if (type.container) {
                    const res = await this.parseContainer(type.container, element.len >= 0 ? this.tokenizer.position + element.len : -1, path.concat([type.name]));
                    if (type.multiple) {
                        if (!tree[type.name]) {
                            tree[type.name] = [];
                        }
                        tree[type.name].push(res);
                    }
                    else {
                        tree[type.name] = res;
                    }
                }
                else {
                    tree[type.name] = await this.parserMap.get(type.value)(element);
                }
            }
            else {
                switch (element.id) {
                    case 0xec: // void
                        this.padding += element.len;
                        await this.tokenizer.ignore(element.len);
                        break;
                    default:
                        debug(`parseEbml: path=${path.join('/')}, unknown element: id=${element.id.toString(16)}`);
                        this.padding += element.len;
                        await this.tokenizer.ignore(element.len);
                }
            }
        }
        return tree;
    }
    async readVintData(maxLength) {
        const msb = await this.tokenizer.peekNumber(token_types_1.UINT8);
        let mask = 0x80;
        let oc = 1;
        // Calculate VINT_WIDTH
        while ((msb & mask) === 0) {
            if (oc > maxLength) {
                throw new Error('VINT value exceeding maximum size');
            }
            ++oc;
            mask >>= 1;
        }
        const id = Buffer.alloc(oc);
        await this.tokenizer.readBuffer(id);
        return id;
    }
    async readElement() {
        const id = await this.readVintData(this.ebmlMaxIDLength);
        const lenField = await this.readVintData(this.ebmlMaxSizeLength);
        lenField[0] ^= 0x80 >> (lenField.length - 1);
        const nrLen = Math.min(6, lenField.length); // JavaScript can max read 6 bytes integer
        return {
            id: id.readUIntBE(0, id.length),
            len: lenField.readUIntBE(lenField.length - nrLen, nrLen)
        };
    }
    isMaxValue(vintData) {
        if (vintData.length === this.ebmlMaxSizeLength) {
            for (let n = 1; n < this.ebmlMaxSizeLength; ++n) {
                if (vintData[n] !== 0xff)
                    return false;
            }
            return true;
        }
        return false;
    }
    async readFloat(e) {
        switch (e.len) {
            case 0:
                return 0.0;
            case 4:
                return this.tokenizer.readNumber(token_types_1.Float32_BE);
            case 8:
                return this.tokenizer.readNumber(token_types_1.Float64_BE);
            case 10:
                return this.tokenizer.readNumber(token_types_1.Float64_BE);
            default:
                throw new Error(`Invalid IEEE-754 float length: ${e.len}`);
        }
    }
    async readFlag(e) {
        return (await this.readUint(e)) === 1;
    }
    async readUint(e) {
        const buf = await this.readBuffer(e);
        const nrLen = Math.min(6, e.len); // JavaScript can max read 6 bytes integer
        return buf.readUIntBE(e.len - nrLen, nrLen);
    }
    async readString(e) {
        const rawString = await this.tokenizer.readToken(new token_types_1.StringType(e.len, 'utf-8'));
        return rawString.replace(/\00.*$/g, '');
    }
    async readBuffer(e) {
        const buf = Buffer.alloc(e.len);
        await this.tokenizer.readBuffer(buf);
        return buf;
    }
    addTag(tagId, value) {
        this.metadata.addTag('matroska', tagId, value);
    }
}
exports.MatroskaParser = MatroskaParser;
