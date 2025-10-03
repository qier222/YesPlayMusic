"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MP4Parser = void 0;
const debug_1 = require("debug");
const Token = require("token-types");
const BasicParser_1 = require("../common/BasicParser");
const ID3v1Parser_1 = require("../id3v1/ID3v1Parser");
const type_1 = require("../type");
const Atom_1 = require("./Atom");
const AtomToken = require("./AtomToken");
const debug = (0, debug_1.default)('music-metadata:parser:MP4');
const tagFormat = 'iTunes';
const encoderDict = {
    raw: {
        lossy: false,
        format: 'raw'
    },
    MAC3: {
        lossy: true,
        format: 'MACE 3:1'
    },
    MAC6: {
        lossy: true,
        format: 'MACE 6:1'
    },
    ima4: {
        lossy: true,
        format: 'IMA 4:1'
    },
    ulaw: {
        lossy: true,
        format: 'uLaw 2:1'
    },
    alaw: {
        lossy: true,
        format: 'uLaw 2:1'
    },
    Qclp: {
        lossy: true,
        format: 'QUALCOMM PureVoice'
    },
    '.mp3': {
        lossy: true,
        format: 'MPEG-1 layer 3'
    },
    alac: {
        lossy: false,
        format: 'ALAC'
    },
    'ac-3': {
        lossy: true,
        format: 'AC-3'
    },
    mp4a: {
        lossy: true,
        format: 'MPEG-4/AAC'
    },
    mp4s: {
        lossy: true,
        format: 'MP4S'
    },
    // Closed Captioning Media, https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-SW87
    c608: {
        lossy: true,
        format: 'CEA-608'
    },
    c708: {
        lossy: true,
        format: 'CEA-708'
    }
};
function distinct(value, index, self) {
    return self.indexOf(value) === index;
}
/*
 * Parser for the MP4 (MPEG-4 Part 14) container format
 * Standard: ISO/IEC 14496-14
 * supporting:
 * - QuickTime container
 * - MP4 File Format
 * - 3GPP file format
 * - 3GPP2 file format
 *
 * MPEG-4 Audio / Part 3 (.m4a)& MPEG 4 Video (m4v, mp4) extension.
 * Support for Apple iTunes tags as found in a M4A/M4V files.
 * Ref:
 *   https://en.wikipedia.org/wiki/ISO_base_media_file_format
 *   https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/Metadata/Metadata.html
 *   http://atomicparsley.sourceforge.net/mpeg-4files.html
 *   https://github.com/sergiomb2/libmp4v2/wiki/iTunesMetadata
 *   https://wiki.multimedia.cx/index.php/QuickTime_container
 */
class MP4Parser extends BasicParser_1.BasicParser {
    constructor() {
        super(...arguments);
        this.atomParsers = {
            /**
             * Parse movie header (mvhd) atom
             * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-56313
             */
            mvhd: async (len) => {
                const mvhd = await this.tokenizer.readToken(new AtomToken.MvhdAtom(len));
                this.metadata.setFormat('creationTime', mvhd.creationTime);
                this.metadata.setFormat('modificationTime', mvhd.modificationTime);
            },
            /**
             * Parse media header (mdhd) atom
             * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25615
             */
            mdhd: async (len) => {
                const mdhd_data = await this.tokenizer.readToken(new AtomToken.MdhdAtom(len));
                // this.parse_mxhd(mdhd_data, this.currentTrack);
                const td = this.getTrackDescription();
                td.creationTime = mdhd_data.creationTime;
                td.modificationTime = mdhd_data.modificationTime;
                td.timeScale = mdhd_data.timeScale;
                td.duration = mdhd_data.duration;
            },
            chap: async (len) => {
                const td = this.getTrackDescription();
                const trackIds = [];
                while (len >= Token.UINT32_BE.len) {
                    trackIds.push(await this.tokenizer.readNumber(Token.UINT32_BE));
                    len -= Token.UINT32_BE.len;
                }
                td.chapterList = trackIds;
            },
            tkhd: async (len) => {
                const track = (await this.tokenizer.readToken(new AtomToken.TrackHeaderAtom(len)));
                this.tracks.push(track);
            },
            /**
             * Parse mdat atom.
             * Will scan for chapters
             */
            mdat: async (len) => {
                this.audioLengthInBytes = len;
                this.calculateBitRate();
                if (this.options.includeChapters) {
                    const trackWithChapters = this.tracks.filter(track => track.chapterList);
                    if (trackWithChapters.length === 1) {
                        const chapterTrackIds = trackWithChapters[0].chapterList;
                        const chapterTracks = this.tracks.filter(track => chapterTrackIds.indexOf(track.trackId) !== -1);
                        if (chapterTracks.length === 1) {
                            return this.parseChapterTrack(chapterTracks[0], trackWithChapters[0], len);
                        }
                    }
                }
                await this.tokenizer.ignore(len);
            },
            ftyp: async (len) => {
                const types = [];
                while (len > 0) {
                    const ftype = await this.tokenizer.readToken(AtomToken.ftyp);
                    len -= AtomToken.ftyp.len;
                    const value = ftype.type.replace(/\W/g, '');
                    if (value.length > 0) {
                        types.push(value); // unshift for backward compatibility
                    }
                }
                debug(`ftyp: ${types.join('/')}`);
                const x = types.filter(distinct).join('/');
                this.metadata.setFormat('container', x);
            },
            /**
             * Parse sample description atom
             */
            stsd: async (len) => {
                const stsd = await this.tokenizer.readToken(new AtomToken.StsdAtom(len));
                const trackDescription = this.getTrackDescription();
                trackDescription.soundSampleDescription = stsd.table.map(dfEntry => this.parseSoundSampleDescription(dfEntry));
            },
            /**
             * sample-to-Chunk Atoms
             */
            stsc: async (len) => {
                const stsc = await this.tokenizer.readToken(new AtomToken.StscAtom(len));
                this.getTrackDescription().sampleToChunkTable = stsc.entries;
            },
            /**
             * time-to-sample table
             */
            stts: async (len) => {
                const stts = await this.tokenizer.readToken(new AtomToken.SttsAtom(len));
                this.getTrackDescription().timeToSampleTable = stts.entries;
            },
            /**
             * Parse sample-sizes atom ('stsz')
             */
            stsz: async (len) => {
                const stsz = await this.tokenizer.readToken(new AtomToken.StszAtom(len));
                const td = this.getTrackDescription();
                td.sampleSize = stsz.sampleSize;
                td.sampleSizeTable = stsz.entries;
            },
            /**
             * Parse chunk-offset atom ('stco')
             */
            stco: async (len) => {
                const stco = await this.tokenizer.readToken(new AtomToken.StcoAtom(len));
                this.getTrackDescription().chunkOffsetTable = stco.entries; // remember chunk offsets
            },
            date: async (len) => {
                const date = await this.tokenizer.readToken(new Token.StringType(len, 'utf-8'));
                this.addTag('date', date);
            }
        };
    }
    static read_BE_Integer(array, signed) {
        const integerType = (signed ? 'INT' : 'UINT') + array.length * 8 + (array.length > 1 ? '_BE' : '');
        const token = Token[integerType];
        if (!token) {
            throw new Error('Token for integer type not found: "' + integerType + '"');
        }
        return Number(token.get(array, 0));
    }
    async parse() {
        this.tracks = [];
        let remainingFileSize = this.tokenizer.fileInfo.size;
        while (!this.tokenizer.fileInfo.size || remainingFileSize > 0) {
            try {
                const token = await this.tokenizer.peekToken(AtomToken.Header);
                if (token.name === '\0\0\0\0') {
                    const errMsg = `Error at offset=${this.tokenizer.position}: box.id=0`;
                    debug(errMsg);
                    this.addWarning(errMsg);
                    break;
                }
            }
            catch (error) {
                const errMsg = `Error at offset=${this.tokenizer.position}: ${error.message}`;
                debug(errMsg);
                this.addWarning(errMsg);
                break;
            }
            const rootAtom = await Atom_1.Atom.readAtom(this.tokenizer, (atom, remaining) => this.handleAtom(atom, remaining), null, remainingFileSize);
            remainingFileSize -= rootAtom.header.length === BigInt(0) ? remainingFileSize : Number(rootAtom.header.length);
        }
        // Post process metadata
        const formatList = [];
        this.tracks.forEach(track => {
            const trackFormats = [];
            track.soundSampleDescription.forEach(ssd => {
                const streamInfo = {};
                const encoderInfo = encoderDict[ssd.dataFormat];
                if (encoderInfo) {
                    trackFormats.push(encoderInfo.format);
                    streamInfo.codecName = encoderInfo.format;
                }
                else {
                    streamInfo.codecName = `<${ssd.dataFormat}>`;
                }
                if (ssd.description) {
                    const { description } = ssd;
                    if (description.sampleRate > 0) {
                        streamInfo.type = type_1.TrackType.audio;
                        streamInfo.audio = {
                            samplingFrequency: description.sampleRate,
                            bitDepth: description.sampleSize,
                            channels: description.numAudioChannels
                        };
                    }
                }
                this.metadata.addStreamInfo(streamInfo);
            });
            if (trackFormats.length >= 1) {
                formatList.push(trackFormats.join('/'));
            }
        });
        if (formatList.length > 0) {
            this.metadata.setFormat('codec', formatList.filter(distinct).join('+'));
        }
        const audioTracks = this.tracks.filter(track => {
            return track.soundSampleDescription.length >= 1 && track.soundSampleDescription[0].description && track.soundSampleDescription[0].description.numAudioChannels > 0;
        });
        if (audioTracks.length >= 1) {
            const audioTrack = audioTracks[0];
            if (audioTrack.timeScale > 0) {
                const duration = audioTrack.duration / audioTrack.timeScale; // calculate duration in seconds
                this.metadata.setFormat('duration', duration);
            }
            const ssd = audioTrack.soundSampleDescription[0];
            if (ssd.description) {
                this.metadata.setFormat('sampleRate', ssd.description.sampleRate);
                this.metadata.setFormat('bitsPerSample', ssd.description.sampleSize);
                this.metadata.setFormat('numberOfChannels', ssd.description.numAudioChannels);
                if (audioTrack.timeScale === 0 && audioTrack.timeToSampleTable.length > 0) {
                    const totalSampleSize = audioTrack.timeToSampleTable
                        .map(ttstEntry => ttstEntry.count * ttstEntry.duration)
                        .reduce((total, sampleSize) => total + sampleSize);
                    const duration = totalSampleSize / ssd.description.sampleRate;
                    this.metadata.setFormat('duration', duration);
                }
            }
            const encoderInfo = encoderDict[ssd.dataFormat];
            if (encoderInfo) {
                this.metadata.setFormat('lossless', !encoderInfo.lossy);
            }
            this.calculateBitRate();
        }
    }
    async handleAtom(atom, remaining) {
        if (atom.parent) {
            switch (atom.parent.header.name) {
                case 'ilst':
                case '<id>':
                    return this.parseMetadataItemData(atom);
            }
        }
        // const payloadLength = atom.getPayloadLength(remaining);
        if (this.atomParsers[atom.header.name]) {
            return this.atomParsers[atom.header.name](remaining);
        }
        else {
            debug(`No parser for atom path=${atom.atomPath}, payload-len=${remaining}, ignoring atom`);
            await this.tokenizer.ignore(remaining);
        }
    }
    getTrackDescription() {
        return this.tracks[this.tracks.length - 1];
    }
    calculateBitRate() {
        if (this.audioLengthInBytes && this.metadata.format.duration) {
            this.metadata.setFormat('bitrate', 8 * this.audioLengthInBytes / this.metadata.format.duration);
        }
    }
    addTag(id, value) {
        this.metadata.addTag(tagFormat, id, value);
    }
    addWarning(message) {
        debug('Warning: ' + message);
        this.metadata.addWarning(message);
    }
    /**
     * Parse data of Meta-item-list-atom (item of 'ilst' atom)
     * @param metaAtom
     * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW8
     */
    parseMetadataItemData(metaAtom) {
        let tagKey = metaAtom.header.name;
        return metaAtom.readAtoms(this.tokenizer, async (child, remaining) => {
            const payLoadLength = child.getPayloadLength(remaining);
            switch (child.header.name) {
                case 'data': // value atom
                    return this.parseValueAtom(tagKey, child);
                case 'name': // name atom (optional)
                case 'mean':
                case 'rate':
                    const name = await this.tokenizer.readToken(new AtomToken.NameAtom(payLoadLength));
                    tagKey += ':' + name.name;
                    break;
                default:
                    const dataAtom = await this.tokenizer.readToken(new Token.BufferType(payLoadLength));
                    this.addWarning('Unsupported meta-item: ' + tagKey + '[' + child.header.name + '] => value=' + dataAtom.toString('hex') + ' ascii=' + dataAtom.toString('ascii'));
            }
        }, metaAtom.getPayloadLength(0));
    }
    async parseValueAtom(tagKey, metaAtom) {
        const dataAtom = await this.tokenizer.readToken(new AtomToken.DataAtom(Number(metaAtom.header.length) - AtomToken.Header.len));
        if (dataAtom.type.set !== 0) {
            throw new Error('Unsupported type-set != 0: ' + dataAtom.type.set);
        }
        // Use well-known-type table
        // Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW35
        switch (dataAtom.type.type) {
            case 0: // reserved: Reserved for use where no type needs to be indicated
                switch (tagKey) {
                    case 'trkn':
                    case 'disk':
                        const num = Token.UINT8.get(dataAtom.value, 3);
                        const of = Token.UINT8.get(dataAtom.value, 5);
                        // console.log("  %s[data] = %s/%s", tagKey, num, of);
                        this.addTag(tagKey, num + '/' + of);
                        break;
                    case 'gnre':
                        const genreInt = Token.UINT8.get(dataAtom.value, 1);
                        const genreStr = ID3v1Parser_1.Genres[genreInt - 1];
                        // console.log("  %s[data] = %s", tagKey, genreStr);
                        this.addTag(tagKey, genreStr);
                        break;
                    case 'rate':
                        const rate = dataAtom.value.toString('ascii');
                        this.addTag(tagKey, rate);
                        break;
                    default:
                        debug('unknown proprietary value type for: ' + metaAtom.atomPath);
                }
                break;
            case 1: // UTF-8: Without any count or NULL terminator
            case 18: // Unknown: Found in m4b in combination with a '©gen' tag
                this.addTag(tagKey, dataAtom.value.toString('utf-8'));
                break;
            case 13: // JPEG
                if (this.options.skipCovers)
                    break;
                this.addTag(tagKey, {
                    format: 'image/jpeg',
                    data: Buffer.from(dataAtom.value)
                });
                break;
            case 14: // PNG
                if (this.options.skipCovers)
                    break;
                this.addTag(tagKey, {
                    format: 'image/png',
                    data: Buffer.from(dataAtom.value)
                });
                break;
            case 21: // BE Signed Integer
                this.addTag(tagKey, MP4Parser.read_BE_Integer(dataAtom.value, true));
                break;
            case 22: // BE Unsigned Integer
                this.addTag(tagKey, MP4Parser.read_BE_Integer(dataAtom.value, false));
                break;
            case 65: // An 8-bit signed integer
                this.addTag(tagKey, dataAtom.value.readInt8(0));
                break;
            case 66: // A big-endian 16-bit signed integer
                this.addTag(tagKey, dataAtom.value.readInt16BE(0));
                break;
            case 67: // A big-endian 32-bit signed integer
                this.addTag(tagKey, dataAtom.value.readInt32BE(0));
                break;
            default:
                this.addWarning(`atom key=${tagKey}, has unknown well-known-type (data-type): ${dataAtom.type.type}`);
        }
    }
    /**
     * @param sampleDescription
     * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-128916
     */
    parseSoundSampleDescription(sampleDescription) {
        const ssd = {
            dataFormat: sampleDescription.dataFormat,
            dataReferenceIndex: sampleDescription.dataReferenceIndex
        };
        let offset = 0;
        const version = AtomToken.SoundSampleDescriptionVersion.get(sampleDescription.description, offset);
        offset += AtomToken.SoundSampleDescriptionVersion.len;
        if (version.version === 0 || version.version === 1) {
            // Sound Sample Description (Version 0)
            ssd.description = AtomToken.SoundSampleDescriptionV0.get(sampleDescription.description, offset);
        }
        else {
            debug(`Warning: sound-sample-description ${version} not implemented`);
        }
        return ssd;
    }
    async parseChapterTrack(chapterTrack, track, len) {
        if (!chapterTrack.sampleSize) {
            if (chapterTrack.chunkOffsetTable.length !== chapterTrack.sampleSizeTable.length)
                throw new Error('Expected equal chunk-offset-table & sample-size-table length.');
        }
        const chapters = [];
        for (let i = 0; i < chapterTrack.chunkOffsetTable.length && len > 0; ++i) {
            const chunkOffset = chapterTrack.chunkOffsetTable[i];
            const nextChunkLen = chunkOffset - this.tokenizer.position;
            const sampleSize = chapterTrack.sampleSize > 0 ? chapterTrack.sampleSize : chapterTrack.sampleSizeTable[i];
            len -= nextChunkLen + sampleSize;
            if (len < 0)
                throw new Error('Chapter chunk exceeding token length');
            await this.tokenizer.ignore(nextChunkLen);
            const title = await this.tokenizer.readToken(new AtomToken.ChapterText(sampleSize));
            debug(`Chapter ${i + 1}: ${title}`);
            const chapter = {
                title,
                sampleOffset: this.findSampleOffset(track, this.tokenizer.position)
            };
            debug(`Chapter title=${chapter.title}, offset=${chapter.sampleOffset}/${this.tracks[0].duration}`);
            chapters.push(chapter);
        }
        this.metadata.setFormat('chapters', chapters);
        await this.tokenizer.ignore(len);
    }
    findSampleOffset(track, chapterOffset) {
        let totalDuration = 0;
        track.timeToSampleTable.forEach(e => {
            totalDuration += e.count * e.duration;
        });
        debug(`Total duration=${totalDuration}`);
        let chunkIndex = 0;
        while (chunkIndex < track.chunkOffsetTable.length && track.chunkOffsetTable[chunkIndex] < chapterOffset) {
            ++chunkIndex;
        }
        return this.getChunkDuration(chunkIndex + 1, track);
    }
    getChunkDuration(chunkId, track) {
        let ttsi = 0;
        let ttsc = track.timeToSampleTable[ttsi].count;
        let ttsd = track.timeToSampleTable[ttsi].duration;
        let curChunkId = 1;
        let samplesPerChunk = this.getSamplesPerChunk(curChunkId, track.sampleToChunkTable);
        let totalDuration = 0;
        while (curChunkId < chunkId) {
            const nrOfSamples = Math.min(ttsc, samplesPerChunk);
            totalDuration += nrOfSamples * ttsd;
            ttsc -= nrOfSamples;
            samplesPerChunk -= nrOfSamples;
            if (samplesPerChunk === 0) {
                ++curChunkId;
                samplesPerChunk = this.getSamplesPerChunk(curChunkId, track.sampleToChunkTable);
            }
            else {
                ++ttsi;
                ttsc = track.timeToSampleTable[ttsi].count;
                ttsd = track.timeToSampleTable[ttsi].duration;
            }
        }
        return totalDuration;
    }
    getSamplesPerChunk(chunkId, stcTable) {
        for (let i = 0; i < stcTable.length - 1; ++i) {
            if (chunkId >= stcTable[i].firstChunk && chunkId < stcTable[i + 1].firstChunk) {
                return stcTable[i].samplesPerChunk;
            }
        }
        return stcTable[stcTable.length - 1].samplesPerChunk;
    }
}
exports.MP4Parser = MP4Parser;
