"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLyricsHeaderLength = exports.endTag2 = void 0;
exports.endTag2 = 'LYRICS200';
async function getLyricsHeaderLength(reader) {
    if (reader.fileSize >= 143) {
        const buf = Buffer.alloc(15);
        await reader.randomRead(buf, 0, buf.length, reader.fileSize - 143);
        const txt = buf.toString('binary');
        const tag = txt.substr(6);
        if (tag === exports.endTag2) {
            return parseInt(txt.substr(0, 6), 10) + 15;
        }
    }
    return 0;
}
exports.getLyricsHeaderLength = getLyricsHeaderLength;
