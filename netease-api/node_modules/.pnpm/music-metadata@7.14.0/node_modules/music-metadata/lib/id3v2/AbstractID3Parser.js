"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractID3Parser = void 0;
const core_1 = require("strtok3/lib/core");
const debug_1 = require("debug");
const ID3v2Token_1 = require("./ID3v2Token");
const ID3v2Parser_1 = require("./ID3v2Parser");
const ID3v1Parser_1 = require("../id3v1/ID3v1Parser");
const BasicParser_1 = require("../common/BasicParser");
const debug = (0, debug_1.default)('music-metadata:parser:ID3');
/**
 * Abstract parser which tries take ID3v2 and ID3v1 headers.
 */
class AbstractID3Parser extends BasicParser_1.BasicParser {
    constructor() {
        super(...arguments);
        this.id3parser = new ID3v2Parser_1.ID3v2Parser();
    }
    static async startsWithID3v2Header(tokenizer) {
        return (await tokenizer.peekToken(ID3v2Token_1.ID3v2Header)).fileIdentifier === 'ID3';
    }
    async parse() {
        try {
            await this.parseID3v2();
        }
        catch (err) {
            if (err instanceof core_1.EndOfStreamError) {
                debug(`End-of-stream`);
            }
            else {
                throw err;
            }
        }
    }
    finalize() {
        return;
    }
    async parseID3v2() {
        await this.tryReadId3v2Headers();
        debug('End of ID3v2 header, go to MPEG-parser: pos=%s', this.tokenizer.position);
        await this.postId3v2Parse();
        if (this.options.skipPostHeaders && this.metadata.hasAny()) {
            this.finalize();
        }
        else {
            const id3v1parser = new ID3v1Parser_1.ID3v1Parser();
            await id3v1parser.init(this.metadata, this.tokenizer, this.options).parse();
            this.finalize();
        }
    }
    async tryReadId3v2Headers() {
        const id3Header = await this.tokenizer.peekToken(ID3v2Token_1.ID3v2Header);
        if (id3Header.fileIdentifier === 'ID3') {
            debug('Found ID3v2 header, pos=%s', this.tokenizer.position);
            await this.id3parser.parse(this.metadata, this.tokenizer, this.options);
            return this.tryReadId3v2Headers();
        }
    }
}
exports.AbstractID3Parser = AbstractID3Parser;
