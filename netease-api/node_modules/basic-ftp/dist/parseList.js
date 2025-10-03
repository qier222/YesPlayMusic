"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseList = void 0;
const dosParser = __importStar(require("./parseListDOS"));
const unixParser = __importStar(require("./parseListUnix"));
const mlsdParser = __importStar(require("./parseListMLSD"));
/**
 * Available directory listing parsers. These are candidates that will be tested
 * in the order presented. The first candidate will be used to parse the whole list.
 */
const availableParsers = [
    dosParser,
    unixParser,
    mlsdParser // Keep MLSD last, may accept filename only
];
function firstCompatibleParser(line, parsers) {
    return parsers.find(parser => parser.testLine(line) === true);
}
function isNotBlank(str) {
    return str.trim() !== "";
}
function isNotMeta(str) {
    return !str.startsWith("total");
}
const REGEX_NEWLINE = /\r?\n/;
/**
 * Parse raw directory listing.
 */
function parseList(rawList) {
    const lines = rawList
        .split(REGEX_NEWLINE)
        .filter(isNotBlank)
        .filter(isNotMeta);
    if (lines.length === 0) {
        return [];
    }
    const testLine = lines[lines.length - 1];
    const parser = firstCompatibleParser(testLine, availableParsers);
    if (!parser) {
        throw new Error("This library only supports MLSD, Unix- or DOS-style directory listing. Your FTP server seems to be using another format. You can see the transmitted listing when setting `client.ftp.verbose = true`. You can then provide a custom parser to `client.parseList`, see the documentation for details.");
    }
    const files = lines
        .map(parser.parseLine)
        .filter((info) => info !== undefined);
    return parser.transformList(files);
}
exports.parseList = parseList;
