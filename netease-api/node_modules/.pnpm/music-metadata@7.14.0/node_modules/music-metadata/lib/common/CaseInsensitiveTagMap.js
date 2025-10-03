"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseInsensitiveTagMap = void 0;
const GenericTagMapper_1 = require("./GenericTagMapper");
class CaseInsensitiveTagMap extends GenericTagMapper_1.CommonTagMapper {
    constructor(tagTypes, tagMap) {
        const upperCaseMap = {};
        for (const tag of Object.keys(tagMap)) {
            upperCaseMap[tag.toUpperCase()] = tagMap[tag];
        }
        super(tagTypes, upperCaseMap);
    }
    /**
     * @tag  Native header tag
     * @return common tag name (alias)
     */
    getCommonName(tag) {
        return this.tagMap[tag.toUpperCase()];
    }
}
exports.CaseInsensitiveTagMap = CaseInsensitiveTagMap;
//# sourceMappingURL=CaseInsensitiveTagMap.js.map