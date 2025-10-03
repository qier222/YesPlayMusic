export interface ParsedDataURI {
    type: string;
    typeFull: string;
    charset: string;
    buffer: ArrayBuffer;
}
/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 */
export declare function dataUriToBuffer(uri: string | URL): ParsedDataURI;
//# sourceMappingURL=index.d.ts.map