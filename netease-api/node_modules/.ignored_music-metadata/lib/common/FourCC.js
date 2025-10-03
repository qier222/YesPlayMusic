"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FourCcToken = void 0;
const util = require("./Util");
const validFourCC = /^[\x21-\x7e©][\x20-\x7e\x00()]{3}/;
/**
 * Token for read FourCC
 * Ref: https://en.wikipedia.org/wiki/FourCC
 */
exports.FourCcToken = {
    len: 4,
    get: (buf, off) => {
        const id = buf.toString('binary', off, off + exports.FourCcToken.len);
        if (!id.match(validFourCC)) {
            throw new Error(`FourCC contains invalid characters: ${util.a2hex(id)} "${id}"`);
        }
        return id;
    },
    put: (buffer, offset, id) => {
        const str = Buffer.from(id, 'binary');
        if (str.length !== 4)
            throw new Error('Invalid length');
        return str.copy(buffer, offset);
    }
};
//# sourceMappingURL=FourCC.js.map