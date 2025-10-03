"use strict";
// ASF Objects
Object.defineProperty(exports, "__esModule", { value: true });
exports.WmPictureToken = exports.MetadataLibraryObjectState = exports.MetadataObjectState = exports.ExtendedStreamPropertiesObjectState = exports.ExtendedContentDescriptionObjectState = exports.ContentDescriptionObjectState = exports.readCodecEntries = exports.HeaderExtensionObject = exports.StreamPropertiesObject = exports.FilePropertiesObject = exports.IgnoreObjectState = exports.State = exports.HeaderObjectToken = exports.TopLevelHeaderObjectToken = exports.DataType = void 0;
const util = require("../common/Util");
const Token = require("token-types");
const GUID_1 = require("./GUID");
const AsfUtil_1 = require("./AsfUtil");
const ID3v2Token_1 = require("../id3v2/ID3v2Token");
/**
 * Data Type: Specifies the type of information being stored. The following values are recognized.
 */
var DataType;
(function (DataType) {
    /**
     * Unicode string. The data consists of a sequence of Unicode characters.
     */
    DataType[DataType["UnicodeString"] = 0] = "UnicodeString";
    /**
     * BYTE array. The type of data is implementation-specific.
     */
    DataType[DataType["ByteArray"] = 1] = "ByteArray";
    /**
     * BOOL. The data is 2 bytes long and should be interpreted as a 16-bit unsigned integer. Only 0x0000 or 0x0001 are permitted values.
     */
    DataType[DataType["Bool"] = 2] = "Bool";
    /**
     * DWORD. The data is 4 bytes long and should be interpreted as a 32-bit unsigned integer.
     */
    DataType[DataType["DWord"] = 3] = "DWord";
    /**
     * QWORD. The data is 8 bytes long and should be interpreted as a 64-bit unsigned integer.
     */
    DataType[DataType["QWord"] = 4] = "QWord";
    /**
     * WORD. The data is 2 bytes long and should be interpreted as a 16-bit unsigned integer.
     */
    DataType[DataType["Word"] = 5] = "Word";
})(DataType = exports.DataType || (exports.DataType = {}));
/**
 * Token for: 3. ASF top-level Header Object
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3
 */
exports.TopLevelHeaderObjectToken = {
    len: 30,
    get: (buf, off) => {
        return {
            objectId: GUID_1.default.fromBin(new Token.BufferType(16).get(buf, off)),
            objectSize: Number(Token.UINT64_LE.get(buf, off + 16)),
            numberOfHeaderObjects: Token.UINT32_LE.get(buf, off + 24)
            // Reserved: 2 bytes
        };
    }
};
/**
 * Token for: 3.1 Header Object (mandatory, one only)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_1
 */
exports.HeaderObjectToken = {
    len: 24,
    get: (buf, off) => {
        return {
            objectId: GUID_1.default.fromBin(new Token.BufferType(16).get(buf, off)),
            objectSize: Number(Token.UINT64_LE.get(buf, off + 16))
        };
    }
};
class State {
    constructor(header) {
        this.len = Number(header.objectSize) - exports.HeaderObjectToken.len;
    }
    postProcessTag(tags, name, valueType, data) {
        if (name === 'WM/Picture') {
            tags.push({ id: name, value: WmPictureToken.fromBuffer(data) });
        }
        else {
            const parseAttr = AsfUtil_1.AsfUtil.getParserForAttr(valueType);
            if (!parseAttr) {
                throw new Error('unexpected value headerType: ' + valueType);
            }
            tags.push({ id: name, value: parseAttr(data) });
        }
    }
}
exports.State = State;
// ToDo: use ignore type
class IgnoreObjectState extends State {
    constructor(header) {
        super(header);
    }
    get(buf, off) {
        return null;
    }
}
exports.IgnoreObjectState = IgnoreObjectState;
/**
 * Token for: 3.2: File Properties Object (mandatory, one only)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_2
 */
class FilePropertiesObject extends State {
    constructor(header) {
        super(header);
    }
    get(buf, off) {
        return {
            fileId: GUID_1.default.fromBin(buf, off),
            fileSize: Token.UINT64_LE.get(buf, off + 16),
            creationDate: Token.UINT64_LE.get(buf, off + 24),
            dataPacketsCount: Token.UINT64_LE.get(buf, off + 32),
            playDuration: Token.UINT64_LE.get(buf, off + 40),
            sendDuration: Token.UINT64_LE.get(buf, off + 48),
            preroll: Token.UINT64_LE.get(buf, off + 56),
            flags: {
                broadcast: util.getBit(buf, off + 64, 24),
                seekable: util.getBit(buf, off + 64, 25)
            },
            // flagsNumeric: Token.UINT32_LE.get(buf, off + 64),
            minimumDataPacketSize: Token.UINT32_LE.get(buf, off + 68),
            maximumDataPacketSize: Token.UINT32_LE.get(buf, off + 72),
            maximumBitrate: Token.UINT32_LE.get(buf, off + 76)
        };
    }
}
FilePropertiesObject.guid = GUID_1.default.FilePropertiesObject;
exports.FilePropertiesObject = FilePropertiesObject;
/**
 * Token for: 3.3 Stream Properties Object (mandatory, one per stream)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_3
 */
class StreamPropertiesObject extends State {
    constructor(header) {
        super(header);
    }
    get(buf, off) {
        return {
            streamType: GUID_1.default.decodeMediaType(GUID_1.default.fromBin(buf, off)),
            errorCorrectionType: GUID_1.default.fromBin(buf, off + 8)
            // ToDo
        };
    }
}
StreamPropertiesObject.guid = GUID_1.default.StreamPropertiesObject;
exports.StreamPropertiesObject = StreamPropertiesObject;
/**
 * 3.4: Header Extension Object (mandatory, one only)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_4
 */
class HeaderExtensionObject {
    constructor() {
        this.len = 22;
    }
    get(buf, off) {
        return {
            reserved1: GUID_1.default.fromBin(buf, off),
            reserved2: buf.readUInt16LE(off + 16),
            extensionDataSize: buf.readUInt32LE(off + 18)
        };
    }
}
HeaderExtensionObject.guid = GUID_1.default.HeaderExtensionObject;
exports.HeaderExtensionObject = HeaderExtensionObject;
/**
 * 3.5: The Codec List Object provides user-friendly information about the codecs and formats used to encode the content found in the ASF file.
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_5
 */
const CodecListObjectHeader = {
    len: 20,
    get: (buf, off) => {
        return {
            entryCount: buf.readUInt16LE(off + 16)
        };
    }
};
async function readString(tokenizer) {
    const length = await tokenizer.readNumber(Token.UINT16_LE);
    return (await tokenizer.readToken(new Token.StringType(length * 2, 'utf16le'))).replace('\0', '');
}
/**
 * 3.5: Read the Codec-List-Object, which provides user-friendly information about the codecs and formats used to encode the content found in the ASF file.
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_5
 */
async function readCodecEntries(tokenizer) {
    const codecHeader = await tokenizer.readToken(CodecListObjectHeader);
    const entries = [];
    for (let i = 0; i < codecHeader.entryCount; ++i) {
        entries.push(await readCodecEntry(tokenizer));
    }
    return entries;
}
exports.readCodecEntries = readCodecEntries;
async function readInformation(tokenizer) {
    const length = await tokenizer.readNumber(Token.UINT16_LE);
    const buf = Buffer.alloc(length);
    await tokenizer.readBuffer(buf);
    return buf;
}
/**
 * Read Codec-Entries
 * @param tokenizer
 */
async function readCodecEntry(tokenizer) {
    const type = await tokenizer.readNumber(Token.UINT16_LE);
    return {
        type: {
            videoCodec: (type & 0x0001) === 0x0001,
            audioCodec: (type & 0x0002) === 0x0002
        },
        codecName: await readString(tokenizer),
        description: await readString(tokenizer),
        information: await readInformation(tokenizer)
    };
}
/**
 * 3.10 Content Description Object (optional, one only)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_10
 */
class ContentDescriptionObjectState extends State {
    constructor(header) {
        super(header);
    }
    get(buf, off) {
        const tags = [];
        let pos = off + 10;
        for (let i = 0; i < ContentDescriptionObjectState.contentDescTags.length; ++i) {
            const length = buf.readUInt16LE(off + i * 2);
            if (length > 0) {
                const tagName = ContentDescriptionObjectState.contentDescTags[i];
                const end = pos + length;
                tags.push({ id: tagName, value: AsfUtil_1.AsfUtil.parseUnicodeAttr(buf.slice(pos, end)) });
                pos = end;
            }
        }
        return tags;
    }
}
ContentDescriptionObjectState.guid = GUID_1.default.ContentDescriptionObject;
ContentDescriptionObjectState.contentDescTags = ['Title', 'Author', 'Copyright', 'Description', 'Rating'];
exports.ContentDescriptionObjectState = ContentDescriptionObjectState;
/**
 * 3.11 Extended Content Description Object (optional, one only)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_11
 */
class ExtendedContentDescriptionObjectState extends State {
    constructor(header) {
        super(header);
    }
    get(buf, off) {
        const tags = [];
        const attrCount = buf.readUInt16LE(off);
        let pos = off + 2;
        for (let i = 0; i < attrCount; i += 1) {
            const nameLen = buf.readUInt16LE(pos);
            pos += 2;
            const name = AsfUtil_1.AsfUtil.parseUnicodeAttr(buf.slice(pos, pos + nameLen));
            pos += nameLen;
            const valueType = buf.readUInt16LE(pos);
            pos += 2;
            const valueLen = buf.readUInt16LE(pos);
            pos += 2;
            const value = buf.slice(pos, pos + valueLen);
            pos += valueLen;
            this.postProcessTag(tags, name, valueType, value);
        }
        return tags;
    }
}
ExtendedContentDescriptionObjectState.guid = GUID_1.default.ExtendedContentDescriptionObject;
exports.ExtendedContentDescriptionObjectState = ExtendedContentDescriptionObjectState;
/**
 * 4.1 Extended Stream Properties Object (optional, 1 per media stream)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/04_objects_in_the_asf_header_extension_object.html#4_1
 */
class ExtendedStreamPropertiesObjectState extends State {
    constructor(header) {
        super(header);
    }
    get(buf, off) {
        return {
            startTime: Token.UINT64_LE.get(buf, off),
            endTime: Token.UINT64_LE.get(buf, off + 8),
            dataBitrate: buf.readInt32LE(off + 12),
            bufferSize: buf.readInt32LE(off + 16),
            initialBufferFullness: buf.readInt32LE(off + 20),
            alternateDataBitrate: buf.readInt32LE(off + 24),
            alternateBufferSize: buf.readInt32LE(off + 28),
            alternateInitialBufferFullness: buf.readInt32LE(off + 32),
            maximumObjectSize: buf.readInt32LE(off + 36),
            flags: {
                reliableFlag: util.getBit(buf, off + 40, 0),
                seekableFlag: util.getBit(buf, off + 40, 1),
                resendLiveCleanpointsFlag: util.getBit(buf, off + 40, 2)
            },
            // flagsNumeric: Token.UINT32_LE.get(buf, off + 64),
            streamNumber: buf.readInt16LE(off + 42),
            streamLanguageId: buf.readInt16LE(off + 44),
            averageTimePerFrame: buf.readInt32LE(off + 52),
            streamNameCount: buf.readInt32LE(off + 54),
            payloadExtensionSystems: buf.readInt32LE(off + 56),
            streamNames: [],
            streamPropertiesObject: null
        };
    }
}
ExtendedStreamPropertiesObjectState.guid = GUID_1.default.ExtendedStreamPropertiesObject;
exports.ExtendedStreamPropertiesObjectState = ExtendedStreamPropertiesObjectState;
/**
 * 4.7  Metadata Object (optional, 0 or 1)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/04_objects_in_the_asf_header_extension_object.html#4_7
 */
class MetadataObjectState extends State {
    constructor(header) {
        super(header);
    }
    get(uint8Array, off) {
        const tags = [];
        const buf = Buffer.from(uint8Array);
        const descriptionRecordsCount = buf.readUInt16LE(off);
        let pos = off + 2;
        for (let i = 0; i < descriptionRecordsCount; i += 1) {
            pos += 4;
            const nameLen = buf.readUInt16LE(pos);
            pos += 2;
            const dataType = buf.readUInt16LE(pos);
            pos += 2;
            const dataLen = buf.readUInt32LE(pos);
            pos += 4;
            const name = AsfUtil_1.AsfUtil.parseUnicodeAttr(buf.slice(pos, pos + nameLen));
            pos += nameLen;
            const data = buf.slice(pos, pos + dataLen);
            pos += dataLen;
            this.postProcessTag(tags, name, dataType, data);
        }
        return tags;
    }
}
MetadataObjectState.guid = GUID_1.default.MetadataObject;
exports.MetadataObjectState = MetadataObjectState;
// 4.8	Metadata Library Object (optional, 0 or 1)
class MetadataLibraryObjectState extends MetadataObjectState {
    constructor(header) {
        super(header);
    }
}
MetadataLibraryObjectState.guid = GUID_1.default.MetadataLibraryObject;
exports.MetadataLibraryObjectState = MetadataLibraryObjectState;
/**
 * Ref: https://msdn.microsoft.com/en-us/library/windows/desktop/dd757977(v=vs.85).aspx
 */
class WmPictureToken {
    static fromBase64(base64str) {
        return this.fromBuffer(Buffer.from(base64str, 'base64'));
    }
    static fromBuffer(buffer) {
        const pic = new WmPictureToken(buffer.length);
        return pic.get(buffer, 0);
    }
    constructor(len) {
        this.len = len;
    }
    get(buffer, offset) {
        const typeId = buffer.readUInt8(offset++);
        const size = buffer.readInt32LE(offset);
        let index = 5;
        while (buffer.readUInt16BE(index) !== 0) {
            index += 2;
        }
        const format = buffer.slice(5, index).toString('utf16le');
        while (buffer.readUInt16BE(index) !== 0) {
            index += 2;
        }
        const description = buffer.slice(5, index).toString('utf16le');
        return {
            type: ID3v2Token_1.AttachedPictureType[typeId],
            format,
            description,
            size,
            data: buffer.slice(index + 4)
        };
    }
}
exports.WmPictureToken = WmPictureToken;
