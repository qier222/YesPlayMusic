"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plusx = void 0;
const fs_extra_1 = require("fs-extra");
async function plusx(file) {
    const s = await (0, fs_extra_1.stat)(file);
    const newMode = s.mode | 64 | 8 | 1;
    if (s.mode === newMode) {
        return;
    }
    const base8 = newMode.toString(8).slice(-3);
    await (0, fs_extra_1.chmod)(file, base8);
}
exports.plusx = plusx;
//# sourceMappingURL=chmod.js.map