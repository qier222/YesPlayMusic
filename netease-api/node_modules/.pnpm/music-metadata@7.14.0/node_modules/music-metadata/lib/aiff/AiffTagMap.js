"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiffTagMapper = void 0;
const GenericTagMapper_1 = require("../common/GenericTagMapper");
/**
 * ID3v1 tag mappings
 */
const tagMap = {
    NAME: 'title',
    AUTH: 'artist',
    '(c) ': 'copyright',
    ANNO: 'comment'
};
class AiffTagMapper extends GenericTagMapper_1.CommonTagMapper {
    constructor() {
        super(['AIFF'], tagMap);
    }
}
exports.AiffTagMapper = AiffTagMapper;
//# sourceMappingURL=AiffTagMap.js.map