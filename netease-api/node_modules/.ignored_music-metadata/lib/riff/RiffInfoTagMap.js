"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiffInfoTagMapper = exports.riffInfoTagMap = void 0;
const GenericTagMapper_1 = require("../common/GenericTagMapper");
/**
 * RIFF Info Tags; part of the EXIF 2.3
 * Ref: http://owl.phy.queensu.ca/~phil/exiftool/TagNames/RIFF.html#Info
 */
exports.riffInfoTagMap = {
    IART: 'artist',
    ICRD: 'date',
    INAM: 'title',
    TITL: 'title',
    IPRD: 'album',
    ITRK: 'track',
    IPRT: 'track',
    COMM: 'comment',
    ICMT: 'comment',
    ICNT: 'releasecountry',
    GNRE: 'genre',
    IWRI: 'writer',
    RATE: 'rating',
    YEAR: 'year',
    ISFT: 'encodedby',
    CODE: 'encodedby',
    TURL: 'website',
    IGNR: 'genre',
    IENG: 'engineer',
    ITCH: 'technician',
    IMED: 'media',
    IRPD: 'album' // Product, where the file was intended for
};
class RiffInfoTagMapper extends GenericTagMapper_1.CommonTagMapper {
    constructor() {
        super(['exif'], exports.riffInfoTagMap);
    }
}
exports.RiffInfoTagMapper = RiffInfoTagMapper;
//# sourceMappingURL=RiffInfoTagMap.js.map