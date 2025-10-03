"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsfUtil = void 0;
const Token = require("token-types");
const util = require("../common/Util");
class AsfUtil {
    static getParserForAttr(i) {
        return AsfUtil.attributeParsers[i];
    }
    static parseUnicodeAttr(uint8Array) {
        return util.stripNulls(util.decodeString(uint8Array, 'utf16le'));
    }
    static parseByteArrayAttr(buf) {
        return Buffer.from(buf);
    }
    static parseBoolAttr(buf, offset = 0) {
        return AsfUtil.parseWordAttr(buf, offset) === 1;
    }
    static parseDWordAttr(buf, offset = 0) {
        return buf.readUInt32LE(offset);
    }
    static parseQWordAttr(buf, offset = 0) {
        return Token.UINT64_LE.get(buf, offset);
    }
    static parseWordAttr(buf, offset = 0) {
        return buf.readUInt16LE(offset);
    }
}
AsfUtil.attributeParsers = [
    AsfUtil.parseUnicodeAttr,
    AsfUtil.parseByteArrayAttr,
    AsfUtil.parseBoolAttr,
    AsfUtil.parseDWordAttr,
    AsfUtil.parseQWordAttr,
    AsfUtil.parseWordAttr,
    AsfUtil.parseByteArrayAttr
];
exports.AsfUtil = AsfUtil;
