"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserFactory = exports.parseHttpContentType = void 0;
const FileType = require("file-type/core");
const ContentType = require("content-type");
const MimeType = require("media-typer");
const debug_1 = require("debug");
const MetadataCollector_1 = require("./common/MetadataCollector");
const AiffParser_1 = require("./aiff/AiffParser");
const APEv2Parser_1 = require("./apev2/APEv2Parser");
const AsfParser_1 = require("./asf/AsfParser");
const FlacParser_1 = require("./flac/FlacParser");
const MP4Parser_1 = require("./mp4/MP4Parser");
const MpegParser_1 = require("./mpeg/MpegParser");
const musepack_1 = require("./musepack");
const OggParser_1 = require("./ogg/OggParser");
const WaveParser_1 = require("./wav/WaveParser");
const WavPackParser_1 = require("./wavpack/WavPackParser");
const DsfParser_1 = require("./dsf/DsfParser");
const DsdiffParser_1 = require("./dsdiff/DsdiffParser");
const MatroskaParser_1 = require("./matroska/MatroskaParser");
const debug = (0, debug_1.default)('music-metadata:parser:factory');
function parseHttpContentType(contentType) {
    const type = ContentType.parse(contentType);
    const mime = MimeType.parse(type.type);
    return {
        type: mime.type,
        subtype: mime.subtype,
        suffix: mime.suffix,
        parameters: type.parameters
    };
}
exports.parseHttpContentType = parseHttpContentType;
async function parse(tokenizer, parserId, opts = {}) {
    // Parser found, execute parser
    const parser = await ParserFactory.loadParser(parserId);
    const metadata = new MetadataCollector_1.MetadataCollector(opts);
    await parser.init(metadata, tokenizer, opts).parse();
    return metadata.toCommonMetadata();
}
class ParserFactory {
    /**
     * Parse metadata from tokenizer
     * @param tokenizer - Tokenizer
     * @param opts - Options
     * @returns Native metadata
     */
    static async parseOnContentType(tokenizer, opts) {
        const { mimeType, path, url } = await tokenizer.fileInfo;
        // Resolve parser based on MIME-type or file extension
        const parserId = ParserFactory.getParserIdForMimeType(mimeType) || ParserFactory.getParserIdForExtension(path) || ParserFactory.getParserIdForExtension(url);
        if (!parserId) {
            debug('No parser found for MIME-type / extension: ' + mimeType);
        }
        return this.parse(tokenizer, parserId, opts);
    }
    static async parse(tokenizer, parserId, opts) {
        if (!parserId) {
            // Parser could not be determined on MIME-type or extension
            debug('Guess parser on content...');
            const buf = Buffer.alloc(4100);
            await tokenizer.peekBuffer(buf, { mayBeLess: true });
            if (tokenizer.fileInfo.path) {
                parserId = this.getParserIdForExtension(tokenizer.fileInfo.path);
            }
            if (!parserId) {
                const guessedType = await FileType.fromBuffer(buf);
                if (!guessedType) {
                    throw new Error('Failed to determine audio format');
                }
                debug(`Guessed file type is mime=${guessedType.mime}, extension=${guessedType.ext}`);
                parserId = ParserFactory.getParserIdForMimeType(guessedType.mime);
                if (!parserId) {
                    throw new Error('Guessed MIME-type not supported: ' + guessedType.mime);
                }
            }
        }
        // Parser found, execute parser
        return parse(tokenizer, parserId, opts);
    }
    /**
     * @param filePath - Path, filename or extension to audio file
     * @return Parser sub-module name
     */
    static getParserIdForExtension(filePath) {
        if (!filePath)
            return;
        const extension = this.getExtension(filePath).toLocaleLowerCase() || filePath;
        switch (extension) {
            case '.mp2':
            case '.mp3':
            case '.m2a':
            case '.aac': // Assume it is ADTS-container
                return 'mpeg';
            case '.ape':
                return 'apev2';
            case '.mp4':
            case '.m4a':
            case '.m4b':
            case '.m4pa':
            case '.m4v':
            case '.m4r':
            case '.3gp':
                return 'mp4';
            case '.wma':
            case '.wmv':
            case '.asf':
                return 'asf';
            case '.flac':
                return 'flac';
            case '.ogg':
            case '.ogv':
            case '.oga':
            case '.ogm':
            case '.ogx':
            case '.opus': // recommended filename extension for Ogg Opus
            case '.spx': // recommended filename extension for Ogg Speex
                return 'ogg';
            case '.aif':
            case '.aiff':
            case '.aifc':
                return 'aiff';
            case '.wav':
            case '.bwf': // Broadcast Wave Format
                return 'riff';
            case '.wv':
            case '.wvp':
                return 'wavpack';
            case '.mpc':
                return 'musepack';
            case '.dsf':
                return 'dsf';
            case '.dff':
                return 'dsdiff';
            case '.mka':
            case '.mkv':
            case '.mk3d':
            case '.mks':
            case '.webm':
                return 'matroska';
        }
    }
    static async loadParser(moduleName) {
        switch (moduleName) {
            case 'aiff': return new AiffParser_1.AIFFParser();
            case 'adts':
            case 'mpeg':
                return new MpegParser_1.MpegParser();
            case 'apev2': return new APEv2Parser_1.APEv2Parser();
            case 'asf': return new AsfParser_1.AsfParser();
            case 'dsf': return new DsfParser_1.DsfParser();
            case 'dsdiff': return new DsdiffParser_1.DsdiffParser();
            case 'flac': return new FlacParser_1.FlacParser();
            case 'mp4': return new MP4Parser_1.MP4Parser();
            case 'musepack': return new musepack_1.default();
            case 'ogg': return new OggParser_1.OggParser();
            case 'riff': return new WaveParser_1.WaveParser();
            case 'wavpack': return new WavPackParser_1.WavPackParser();
            case 'matroska': return new MatroskaParser_1.MatroskaParser();
            default:
                throw new Error(`Unknown parser type: ${moduleName}`);
        }
    }
    static getExtension(fname) {
        const i = fname.lastIndexOf('.');
        return i === -1 ? '' : fname.slice(i);
    }
    /**
     * @param httpContentType - HTTP Content-Type, extension, path or filename
     * @returns Parser sub-module name
     */
    static getParserIdForMimeType(httpContentType) {
        let mime;
        try {
            mime = parseHttpContentType(httpContentType);
        }
        catch (err) {
            debug(`Invalid HTTP Content-Type header value: ${httpContentType}`);
            return;
        }
        const subType = mime.subtype.indexOf('x-') === 0 ? mime.subtype.substring(2) : mime.subtype;
        switch (mime.type) {
            case 'audio':
                switch (subType) {
                    case 'mp3': // Incorrect MIME-type, Chrome, in Web API File object
                    case 'mpeg':
                        return 'mpeg';
                    case 'aac':
                    case 'aacp':
                        return 'adts';
                    case 'flac':
                        return 'flac';
                    case 'ape':
                    case 'monkeys-audio':
                        return 'apev2';
                    case 'mp4':
                    case 'm4a':
                        return 'mp4';
                    case 'ogg': // RFC 7845
                    case 'opus': // RFC 6716
                    case 'speex': // RFC 5574
                        return 'ogg';
                    case 'ms-wma':
                    case 'ms-wmv':
                    case 'ms-asf':
                        return 'asf';
                    case 'aiff':
                    case 'aif':
                    case 'aifc':
                        return 'aiff';
                    case 'vnd.wave':
                    case 'wav':
                    case 'wave':
                        return 'riff';
                    case 'wavpack':
                        return 'wavpack';
                    case 'musepack':
                        return 'musepack';
                    case 'matroska':
                    case 'webm':
                        return 'matroska';
                    case 'dsf':
                        return 'dsf';
                }
                break;
            case 'video':
                switch (subType) {
                    case 'ms-asf':
                    case 'ms-wmv':
                        return 'asf';
                    case 'm4v':
                    case 'mp4':
                        return 'mp4';
                    case 'ogg':
                        return 'ogg';
                    case 'matroska':
                    case 'webm':
                        return 'matroska';
                }
                break;
            case 'application':
                switch (subType) {
                    case 'vnd.ms-asf':
                        return 'asf';
                    case 'ogg':
                        return 'ogg';
                }
                break;
        }
    }
}
exports.ParserFactory = ParserFactory;
