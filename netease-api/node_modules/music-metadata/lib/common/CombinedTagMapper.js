"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinedTagMapper = void 0;
const ID3v1TagMap_1 = require("../id3v1/ID3v1TagMap");
const ID3v24TagMapper_1 = require("../id3v2/ID3v24TagMapper");
const AsfTagMapper_1 = require("../asf/AsfTagMapper");
const ID3v22TagMapper_1 = require("../id3v2/ID3v22TagMapper");
const APEv2TagMapper_1 = require("../apev2/APEv2TagMapper");
const MP4TagMapper_1 = require("../mp4/MP4TagMapper");
const VorbisTagMapper_1 = require("../ogg/vorbis/VorbisTagMapper");
const RiffInfoTagMap_1 = require("../riff/RiffInfoTagMap");
const MatroskaTagMapper_1 = require("../matroska/MatroskaTagMapper");
const AiffTagMap_1 = require("../aiff/AiffTagMap");
class CombinedTagMapper {
    constructor() {
        this.tagMappers = {};
        [
            new ID3v1TagMap_1.ID3v1TagMapper(),
            new ID3v22TagMapper_1.ID3v22TagMapper(),
            new ID3v24TagMapper_1.ID3v24TagMapper(),
            new MP4TagMapper_1.MP4TagMapper(),
            new MP4TagMapper_1.MP4TagMapper(),
            new VorbisTagMapper_1.VorbisTagMapper(),
            new APEv2TagMapper_1.APEv2TagMapper(),
            new AsfTagMapper_1.AsfTagMapper(),
            new RiffInfoTagMap_1.RiffInfoTagMapper(),
            new MatroskaTagMapper_1.MatroskaTagMapper(),
            new AiffTagMap_1.AiffTagMapper()
        ].forEach(mapper => {
            this.registerTagMapper(mapper);
        });
    }
    /**
     * Convert native to generic (common) tags
     * @param tagType Originating tag format
     * @param tag     Native tag to map to a generic tag id
     * @param warnings
     * @return Generic tag result (output of this function)
     */
    mapTag(tagType, tag, warnings) {
        const tagMapper = this.tagMappers[tagType];
        if (tagMapper) {
            return this.tagMappers[tagType].mapGenericTag(tag, warnings);
        }
        throw new Error('No generic tag mapper defined for tag-format: ' + tagType);
    }
    registerTagMapper(genericTagMapper) {
        for (const tagType of genericTagMapper.tagTypes) {
            this.tagMappers[tagType] = genericTagMapper;
        }
    }
}
exports.CombinedTagMapper = CombinedTagMapper;
//# sourceMappingURL=CombinedTagMapper.js.map