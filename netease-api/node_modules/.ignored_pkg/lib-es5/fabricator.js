"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shutdown = exports.fabricateTwice = exports.fabricate = void 0;
const child_process_1 = require("child_process");
const log_1 = require("./log");
const script = `
  var vm = require('vm');
  var module = require('module');
  var stdin = Buffer.alloc(0);
  process.stdin.on('data', function (data) {
    stdin = Buffer.concat([ stdin, data ]);
    if (stdin.length >= 4) {
      var sizeOfSnap = stdin.readInt32LE(0);
      if (stdin.length >= 4 + sizeOfSnap + 4) {
        var sizeOfBody = stdin.readInt32LE(4 + sizeOfSnap);
        if (stdin.length >= 4 + sizeOfSnap + 4 + sizeOfBody) {
          var snap = stdin.toString('utf8', 4, 4 + sizeOfSnap);
          var body = Buffer.alloc(sizeOfBody);
          var startOfBody = 4 + sizeOfSnap + 4;
          stdin.copy(body, 0, startOfBody, startOfBody + sizeOfBody);
          stdin = Buffer.alloc(0);
          var code = module.wrap(body);
          var s = new vm.Script(code, {
            filename: snap,
            produceCachedData: true,
            sourceless: true
          });
          if (!s.cachedDataProduced) {
            console.error('Pkg: Cached data not produced.');
            process.exit(2);
          }
          var h = Buffer.alloc(4);
          var b = s.cachedData;
          h.writeInt32LE(b.length, 0);
          process.stdout.write(h);
          process.stdout.write(b);
        }
      }
    }
  });
  process.stdin.resume();
`;
const children = {};
function fabricate(bakes, fabricator, snap, body, cb) {
    const activeBakes = bakes.filter((bake) => {
        // list of bakes that don't influence the bytecode
        const bake2 = bake.replace(/_/g, '-');
        return !['--prof', '--v8-options', '--trace-opt', '--trace-deopt'].includes(bake2);
    });
    const cmd = fabricator.binaryPath;
    const key = JSON.stringify([cmd, activeBakes]);
    let child = children[key];
    if (!child) {
        const stderr = log_1.log.debugMode ? process.stdout : 'ignore';
        children[key] = (0, child_process_1.spawn)(cmd, activeBakes.concat('-e', script), {
            stdio: ['pipe', 'pipe', stderr],
            env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' },
        });
        child = children[key];
    }
    function kill() {
        delete children[key];
        child.kill();
    }
    let stdout = Buffer.alloc(0);
    function onError(error) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        removeListeners();
        kill();
        cb(new Error(`Failed to make bytecode ${fabricator.nodeRange}-${fabricator.arch} for file ${snap} error (${error.message})`));
    }
    function onClose(code) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        removeListeners();
        kill();
        if (code !== 0) {
            return cb(new Error(`Failed to make bytecode ${fabricator.nodeRange}-${fabricator.arch} for file ${snap}`));
        }
        // eslint-disable-next-line no-console
        console.log(stdout.toString());
        return cb(new Error(`${cmd} closed unexpectedly`));
    }
    function onData(data) {
        stdout = Buffer.concat([stdout, data]);
        if (stdout.length >= 4) {
            const sizeOfBlob = stdout.readInt32LE(0);
            if (stdout.length >= 4 + sizeOfBlob) {
                const blob = Buffer.alloc(sizeOfBlob);
                stdout.copy(blob, 0, 4, 4 + sizeOfBlob);
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                removeListeners();
                return cb(undefined, blob);
            }
        }
    }
    function removeListeners() {
        child.removeListener('error', onError);
        child.removeListener('close', onClose);
        child.stdin.removeListener('error', onError);
        child.stdout.removeListener('error', onError);
        child.stdout.removeListener('data', onData);
    }
    child.on('error', onError);
    child.on('close', onClose);
    child.stdin.on('error', onError);
    child.stdout.on('error', onError);
    child.stdout.on('data', onData);
    const h = Buffer.alloc(4);
    let b = Buffer.from(snap);
    h.writeInt32LE(b.length, 0);
    child.stdin.write(h);
    child.stdin.write(b);
    b = body;
    h.writeInt32LE(b.length, 0);
    child.stdin.write(h);
    child.stdin.write(b);
}
exports.fabricate = fabricate;
function fabricateTwice(bakes, fabricator, snap, body, cb) {
    fabricate(bakes, fabricator, snap, body, (error, buffer) => {
        // node0 can not produce second time, even if first time produced fine,
        // probably because of 'filename' cache. also, there are weird cases
        // when node4 can not compile as well, for example file 'lib/js-yaml/dumper.js'
        // of package js-yaml@3.9.0 does not get bytecode second time on node4-win-x64
        if (error)
            return fabricate(bakes, fabricator, snap, body, cb);
        cb(undefined, buffer);
    });
}
exports.fabricateTwice = fabricateTwice;
function shutdown() {
    for (const key in children) {
        if (children[key]) {
            const child = children[key];
            delete children[key];
            child.kill();
        }
    }
}
exports.shutdown = shutdown;
//# sourceMappingURL=fabricator.js.map