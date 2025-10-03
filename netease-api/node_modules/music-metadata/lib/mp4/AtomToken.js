"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterText = exports.StcoAtom = exports.StszAtom = exports.StscAtom = exports.SampleToChunkToken = exports.SttsAtom = exports.TimeToSampleToken = exports.SoundSampleDescriptionV0 = exports.SoundSampleDescriptionVersion = exports.StsdAtom = exports.TrackHeaderAtom = exports.NameAtom = exports.DataAtom = exports.MvhdAtom = exports.MdhdAtom = exports.FixedLengthAtom = exports.mhdr = exports.tkhd = exports.ftyp = exports.ExtendedSize = exports.Header = void 0;
const Token = require("token-types");
const debug_1 = require("debug");
const FourCC_1 = require("../common/FourCC");
const debug = (0, debug_1.default)('music-metadata:parser:MP4:atom');
exports.Header = {
    len: 8,
    get: (buf, off) => {
        const length = Token.UINT32_BE.get(buf, off);
        if (length < 0)
            throw new Error('Invalid atom header length');
        return {
            length: BigInt(length),
            name: new Token.StringType(4, 'binary').get(buf, off + 4)
        };
    },
    put: (buf, off, hdr) => {
        Token.UINT32_BE.put(buf, off, Number(hdr.length));
        return FourCC_1.FourCcToken.put(buf, off + 4, hdr.name);
    }
};
/**
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap1/qtff1.html#//apple_ref/doc/uid/TP40000939-CH203-38190
 */
exports.ExtendedSize = Token.UINT64_BE;
exports.ftyp = {
    len: 4,
    get: (buf, off) => {
        return {
            type: new Token.StringType(4, 'ascii').get(buf, off)
        };
    }
};
exports.tkhd = {
    len: 4,
    get: (buf, off) => {
        return {
            type: new Token.StringType(4, 'ascii').get(buf, off)
        };
    }
};
/**
 * Token: Movie Header Atom
 */
exports.mhdr = {
    len: 8,
    get: (buf, off) => {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            nextItemID: Token.UINT32_BE.get(buf, off + 4)
        };
    }
};
/**
 * Base class for 'fixed' length atoms.
 * In some cases these atoms are longer then the sum of the described fields.
 * Issue: https://github.com/Borewit/music-metadata/issues/120
 */
class FixedLengthAtom {
    /**
     *
     * @param {number} len Length as specified in the size field
     * @param {number} expLen Total length of sum of specified fields in the standard
     */
    constructor(len, expLen, atomId) {
        this.len = len;
        if (len < expLen) {
            throw new Error(`Atom ${atomId} expected to be ${expLen}, but specifies ${len} bytes long.`);
        }
        else if (len > expLen) {
            debug(`Warning: atom ${atomId} expected to be ${expLen}, but was actually ${len} bytes long.`);
        }
    }
}
exports.FixedLengthAtom = FixedLengthAtom;
/**
 * Timestamp stored in seconds since Mac Epoch (1 January 1904)
 */
const SecondsSinceMacEpoch = {
    len: 4,
    get: (buf, off) => {
        const secondsSinceUnixEpoch = Token.UINT32_BE.get(buf, off) - 2082844800;
        return new Date(secondsSinceUnixEpoch * 1000);
    }
};
/**
 * Token: Media Header Atom
 * Ref:
 * - https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-SW34
 * - https://wiki.multimedia.cx/index.php/QuickTime_container#mdhd
 */
class MdhdAtom extends FixedLengthAtom {
    constructor(len) {
        super(len, 24, 'mdhd');
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off + 0),
            flags: Token.UINT24_BE.get(buf, off + 1),
            creationTime: SecondsSinceMacEpoch.get(buf, off + 4),
            modificationTime: SecondsSinceMacEpoch.get(buf, off + 8),
            timeScale: Token.UINT32_BE.get(buf, off + 12),
            duration: Token.UINT32_BE.get(buf, off + 16),
            language: Token.UINT16_BE.get(buf, off + 20),
            quality: Token.UINT16_BE.get(buf, off + 22)
        };
    }
}
exports.MdhdAtom = MdhdAtom;
/**
 * Token: Movie Header Atom
 */
class MvhdAtom extends FixedLengthAtom {
    constructor(len) {
        super(len, 100, 'mvhd');
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            creationTime: SecondsSinceMacEpoch.get(buf, off + 4),
            modificationTime: SecondsSinceMacEpoch.get(buf, off + 8),
            timeScale: Token.UINT32_BE.get(buf, off + 12),
            duration: Token.UINT32_BE.get(buf, off + 16),
            preferredRate: Token.UINT32_BE.get(buf, off + 20),
            preferredVolume: Token.UINT16_BE.get(buf, off + 24),
            // ignore reserver: 10 bytes
            // ignore matrix structure: 36 bytes
            previewTime: Token.UINT32_BE.get(buf, off + 72),
            previewDuration: Token.UINT32_BE.get(buf, off + 76),
            posterTime: Token.UINT32_BE.get(buf, off + 80),
            selectionTime: Token.UINT32_BE.get(buf, off + 84),
            selectionDuration: Token.UINT32_BE.get(buf, off + 88),
            currentTime: Token.UINT32_BE.get(buf, off + 92),
            nextTrackID: Token.UINT32_BE.get(buf, off + 96)
        };
    }
}
exports.MvhdAtom = MvhdAtom;
/**
 * Data Atom Structure
 */
class DataAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            type: {
                set: Token.UINT8.get(buf, off + 0),
                type: Token.UINT24_BE.get(buf, off + 1)
            },
            locale: Token.UINT24_BE.get(buf, off + 4),
            value: Buffer.from(new Token.Uint8ArrayType(this.len - 8).get(buf, off + 8))
        };
    }
}
exports.DataAtom = DataAtom;
/**
 * Data Atom Structure
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW31
 */
class NameAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            name: new Token.StringType(this.len - 4, 'utf-8').get(buf, off + 4)
        };
    }
}
exports.NameAtom = NameAtom;
/**
 * Track Header Atoms structure
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25550
 */
class TrackHeaderAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            creationTime: SecondsSinceMacEpoch.get(buf, off + 4),
            modificationTime: SecondsSinceMacEpoch.get(buf, off + 8),
            trackId: Token.UINT32_BE.get(buf, off + 12),
            // reserved 4 bytes
            duration: Token.UINT32_BE.get(buf, off + 20),
            layer: Token.UINT16_BE.get(buf, off + 24),
            alternateGroup: Token.UINT16_BE.get(buf, off + 26),
            volume: Token.UINT16_BE.get(buf, off + 28) // ToDo: fixed point
            // ToDo: add remaining fields
        };
    }
}
exports.TrackHeaderAtom = TrackHeaderAtom;
/**
 * Atom: Sample Description Atom ('stsd')
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
 */
const stsdHeader = {
    len: 8,
    get: (buf, off) => {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            numberOfEntries: Token.UINT32_BE.get(buf, off + 4)
        };
    }
};
/**
 * Atom: Sample Description Atom ('stsd')
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
 */
class SampleDescriptionTable {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            dataFormat: FourCC_1.FourCcToken.get(buf, off),
            dataReferenceIndex: Token.UINT16_BE.get(buf, off + 10),
            description: new Token.Uint8ArrayType(this.len - 12).get(buf, off + 12)
        };
    }
}
/**
 * Atom: Sample-description Atom ('stsd')
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
 */
class StsdAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        const header = stsdHeader.get(buf, off);
        off += stsdHeader.len;
        const table = [];
        for (let n = 0; n < header.numberOfEntries; ++n) {
            const size = Token.UINT32_BE.get(buf, off); // Sample description size
            off += Token.UINT32_BE.len;
            table.push(new SampleDescriptionTable(size).get(buf, off));
            off += size;
        }
        return {
            header,
            table
        };
    }
}
exports.StsdAtom = StsdAtom;
/**
 * Common Sound Sample Description (version & revision)
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-57317
 */
exports.SoundSampleDescriptionVersion = {
    len: 8,
    get(buf, off) {
        return {
            version: Token.INT16_BE.get(buf, off),
            revision: Token.INT16_BE.get(buf, off + 2),
            vendor: Token.INT32_BE.get(buf, off + 4)
        };
    }
};
/**
 * Sound Sample Description (Version 0)
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-130736
 */
exports.SoundSampleDescriptionV0 = {
    len: 12,
    get(buf, off) {
        return {
            numAudioChannels: Token.INT16_BE.get(buf, off + 0),
            sampleSize: Token.INT16_BE.get(buf, off + 2),
            compressionId: Token.INT16_BE.get(buf, off + 4),
            packetSize: Token.INT16_BE.get(buf, off + 6),
            sampleRate: Token.UINT16_BE.get(buf, off + 8) + Token.UINT16_BE.get(buf, off + 10) / 10000
        };
    }
};
class SimpleTableAtom {
    constructor(len, token) {
        this.len = len;
        this.token = token;
    }
    get(buf, off) {
        const nrOfEntries = Token.INT32_BE.get(buf, off + 4);
        return {
            version: Token.INT8.get(buf, off + 0),
            flags: Token.INT24_BE.get(buf, off + 1),
            numberOfEntries: nrOfEntries,
            entries: readTokenTable(buf, this.token, off + 8, this.len - 8, nrOfEntries)
        };
    }
}
exports.TimeToSampleToken = {
    len: 8,
    get(buf, off) {
        return {
            count: Token.INT32_BE.get(buf, off + 0),
            duration: Token.INT32_BE.get(buf, off + 4)
        };
    }
};
/**
 * Time-to-sample('stts') atom.
 * Store duration information for a media’s samples.
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25696
 */
class SttsAtom extends SimpleTableAtom {
    constructor(len) {
        super(len, exports.TimeToSampleToken);
        this.len = len;
    }
}
exports.SttsAtom = SttsAtom;
exports.SampleToChunkToken = {
    len: 12,
    get(buf, off) {
        return {
            firstChunk: Token.INT32_BE.get(buf, off),
            samplesPerChunk: Token.INT32_BE.get(buf, off + 4),
            sampleDescriptionId: Token.INT32_BE.get(buf, off + 8)
        };
    }
};
/**
 * Sample-to-Chunk ('stsc') atom interface
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25706
 */
class StscAtom extends SimpleTableAtom {
    constructor(len) {
        super(len, exports.SampleToChunkToken);
        this.len = len;
    }
}
exports.StscAtom = StscAtom;
/**
 * Sample-size ('stsz') atom
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25710
 */
class StszAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        const nrOfEntries = Token.INT32_BE.get(buf, off + 8);
        return {
            version: Token.INT8.get(buf, off),
            flags: Token.INT24_BE.get(buf, off + 1),
            sampleSize: Token.INT32_BE.get(buf, off + 4),
            numberOfEntries: nrOfEntries,
            entries: readTokenTable(buf, Token.INT32_BE, off + 12, this.len - 12, nrOfEntries)
        };
    }
}
exports.StszAtom = StszAtom;
/**
 * Chunk offset atom, 'stco'
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25715
 */
class StcoAtom extends SimpleTableAtom {
    constructor(len) {
        super(len, Token.INT32_BE);
        this.len = len;
    }
}
exports.StcoAtom = StcoAtom;
/**
 * Token used to decode text-track from 'mdat' atom (raw data stream)
 */
class ChapterText {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        const titleLen = Token.INT16_BE.get(buf, off + 0);
        const str = new Token.StringType(titleLen, 'utf-8');
        return str.get(buf, off + 2);
    }
}
exports.ChapterText = ChapterText;
function readTokenTable(buf, token, off, remainingLen, numberOfEntries) {
    debug(`remainingLen=${remainingLen}, numberOfEntries=${numberOfEntries} * token-len=${token.len}`);
    if (remainingLen === 0)
        return [];
    if (remainingLen !== numberOfEntries * token.len)
        throw new Error('mismatch number-of-entries with remaining atom-length');
    const entries = [];
    // parse offset-table
    for (let n = 0; n < numberOfEntries; ++n) {
        entries.push(token.get(buf, off));
        off += token.len;
    }
    return entries;
}
