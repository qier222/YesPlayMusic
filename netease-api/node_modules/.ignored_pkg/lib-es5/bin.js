#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const log_1 = require("./log");
async function main() {
    if (process.env.CHDIR && process.env.CHDIR !== process.cwd()) {
        // allow to override cwd by CHDIR env var
        // https://github.com/resin-io/etcher/pull/1713
        process.chdir(process.env.CHDIR);
    }
    await (0, index_1.exec)(process.argv.slice(2));
}
main().catch((error) => {
    if (!error.wasReported)
        log_1.log.error(error);
    process.exit(2);
});
//# sourceMappingURL=bin.js.map