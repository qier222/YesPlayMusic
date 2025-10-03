"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayGain = void 0;
const common = require("../common/Util");
/**
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format#name-code
 */
var NameCode;
(function (NameCode) {
    /**
     * not set
     */
    NameCode[NameCode["not_set"] = 0] = "not_set";
    /**
     * Radio Gain Adjustment
     */
    NameCode[NameCode["radio"] = 1] = "radio";
    /**
     * Audiophile Gain Adjustment
     */
    NameCode[NameCode["audiophile"] = 2] = "audiophile";
})(NameCode || (NameCode = {}));
/**
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format#originator-code
 */
var ReplayGainOriginator;
(function (ReplayGainOriginator) {
    /**
     * Replay Gain unspecified
     */
    ReplayGainOriginator[ReplayGainOriginator["unspecified"] = 0] = "unspecified";
    /**
     * Replay Gain pre-set by artist/producer/mastering engineer
     */
    ReplayGainOriginator[ReplayGainOriginator["engineer"] = 1] = "engineer";
    /**
     * Replay Gain set by user
     */
    ReplayGainOriginator[ReplayGainOriginator["user"] = 2] = "user";
    /**
     * Replay Gain determined automatically, as described on this site
     */
    ReplayGainOriginator[ReplayGainOriginator["automatic"] = 3] = "automatic";
    /**
     * Set by simple RMS average
     */
    ReplayGainOriginator[ReplayGainOriginator["rms_average"] = 4] = "rms_average";
})(ReplayGainOriginator || (ReplayGainOriginator = {}));
/**
 * Replay Gain Data Format
 *
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format
 */
exports.ReplayGain = {
    len: 2,
    get: (buf, off) => {
        const gain_type = common.getBitAllignedNumber(buf, off, 0, 3);
        const sign = common.getBitAllignedNumber(buf, off, 6, 1);
        const gain_adj = common.getBitAllignedNumber(buf, off, 7, 9) / 10.0;
        if (gain_type > 0) {
            return {
                type: common.getBitAllignedNumber(buf, off, 0, 3),
                origin: common.getBitAllignedNumber(buf, off, 3, 3),
                adjustment: (sign ? -gain_adj : gain_adj)
            };
        }
        return undefined;
    }
};
