"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUriToBuffer = void 0;
function base64ToArrayBuffer(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = [];
    for (let i = 0; i < base64.length; i += 4) {
        const idx0 = chars.indexOf(base64.charAt(i));
        const idx1 = chars.indexOf(base64.charAt(i + 1));
        const idx2 = base64.charAt(i + 2) === '='
            ? 0
            : chars.indexOf(base64.charAt(i + 2));
        const idx3 = base64.charAt(i + 3) === '='
            ? 0
            : chars.indexOf(base64.charAt(i + 3));
        const bin0 = (idx0 << 2) | (idx1 >> 4);
        const bin1 = ((idx1 & 15) << 4) | (idx2 >> 2);
        const bin2 = ((idx2 & 3) << 6) | idx3;
        bytes.push(bin0);
        if (base64.charAt(i + 2) !== '=')
            bytes.push(bin1);
        if (base64.charAt(i + 3) !== '=')
            bytes.push(bin2);
    }
    const buffer = new ArrayBuffer(bytes.length);
    const view = new Uint8Array(buffer);
    view.set(bytes);
    return buffer;
}
function stringToBuffer(str) {
    // Create a buffer with length equal to the string length
    const buffer = new ArrayBuffer(str.length);
    // Create a view to manipulate the buffer content
    const view = new Uint8Array(buffer);
    // Iterate over the string and populate the buffer with ASCII codes
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    return buffer;
}
/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 */
function dataUriToBuffer(uri) {
    uri = String(uri);
    if (!/^data:/i.test(uri)) {
        throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    }
    // strip newlines
    uri = uri.replace(/\r?\n/g, '');
    // split the URI up into the "metadata" and the "data" portions
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
        throw new TypeError('malformed data: URI');
    }
    // remove the "data:" scheme and parse the metadata
    const meta = uri.substring(5, firstComma).split(';');
    let charset = '';
    let base64 = false;
    const type = meta[0] || 'text/plain';
    let typeFull = type;
    for (let i = 1; i < meta.length; i++) {
        if (meta[i] === 'base64') {
            base64 = true;
        }
        else if (meta[i]) {
            typeFull += `;${meta[i]}`;
            if (meta[i].indexOf('charset=') === 0) {
                charset = meta[i].substring(8);
            }
        }
    }
    // defaults to US-ASCII only if type is not provided
    if (!meta[0] && !charset.length) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }
    // get the encoded data portion and decode URI-encoded chars
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = base64 ? base64ToArrayBuffer(data) : stringToBuffer(data);
    return {
        type,
        typeFull,
        charset,
        buffer,
    };
}
exports.dataUriToBuffer = dataUriToBuffer;
//# sourceMappingURL=index.js.map