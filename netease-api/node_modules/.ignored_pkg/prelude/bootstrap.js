/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

/* global EXECPATH_FD */
/* global PAYLOAD_POSITION */
/* global PAYLOAD_SIZE */
/* global REQUIRE_COMMON */
/* global VIRTUAL_FILESYSTEM */
/* global DEFAULT_ENTRYPOINT */
/* global DICT */
/* global DOCOMPRESS */
/* global SYMLINKS */

'use strict';

const childProcess = require('child_process');
const { createHash } = require('crypto');
const fs = require('fs');
const { isRegExp } = require('util').types;
const Module = require('module');
const path = require('path');
const { promisify, _extend } = require('util');
const { Script } = require('vm');
const { tmpdir } = require('os');
const util = require('util');
const {
  brotliDecompress,
  brotliDecompressSync,
  gunzip,
  gunzipSync,
} = require('zlib');

const common = {};
REQUIRE_COMMON(common);

const {
  STORE_BLOB,
  STORE_CONTENT,
  STORE_LINKS,
  STORE_STAT,
  isRootPath,
  normalizePath,
  insideSnapshot,
  stripSnapshot,
  removeUplevels,
} = common;

let FLAG_ENABLE_PROJECT = false;
const NODE_VERSION_MAJOR = process.version.match(/^v(\d+)/)[1] | 0;
const NODE_VERSION_MINOR = process.version.match(/^v\d+.(\d+)/)[1] | 0;

// /////////////////////////////////////////////////////////////////
// ENTRYPOINT //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

// set ENTRYPOINT and ARGV0 here because
// they can be altered during process run
const ARGV0 = process.argv[0];
const EXECPATH = process.execPath;
let ENTRYPOINT = process.argv[1];

if (process.env.PKG_EXECPATH === 'PKG_INVOKE_NODEJS') {
  return { undoPatch: true };
}

if (NODE_VERSION_MAJOR < 12 || require('worker_threads').isMainThread) {
  if (process.argv[1] !== 'PKG_DUMMY_ENTRYPOINT') {
    // expand once patchless is introduced, that
    // will obviously lack any work in node_main.cc
    throw new Error('PKG_DUMMY_ENTRYPOINT EXPECTED');
  }
}

if (process.env.PKG_EXECPATH === EXECPATH) {
  process.argv.splice(1, 1);

  if (process.argv[1] && process.argv[1] !== '-') {
    // https://github.com/nodejs/node/blob/1a96d83a223ff9f05f7d942fb84440d323f7b596/lib/internal/bootstrap/node.js#L269
    process.argv[1] = path.resolve(process.argv[1]);
  }
} else {
  process.argv[1] = DEFAULT_ENTRYPOINT;
}

[, ENTRYPOINT] = process.argv;
delete process.env.PKG_EXECPATH;

// /////////////////////////////////////////////////////////////////
// EXECSTAT ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

const EXECSTAT = fs.statSync(EXECPATH);

EXECSTAT.atimeMs = EXECSTAT.atime.getTime();
EXECSTAT.mtimeMs = EXECSTAT.mtime.getTime();
EXECSTAT.ctimeMs = EXECSTAT.ctime.getTime();
EXECSTAT.birthtimeMs = EXECSTAT.birthtime.getTime();

// /////////////////////////////////////////////////////////////////
// MOUNTPOINTS /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

const mountpoints = [];

function insideMountpoint(f) {
  if (!insideSnapshot(f)) return null;
  const file = normalizePath(f);
  const found = mountpoints
    .map((mountpoint) => {
      const { interior, exterior } = mountpoint;
      if (isRegExp(interior) && interior.test(file))
        return file.replace(interior, exterior);
      if (interior === file) return exterior;
      const left = interior + path.sep;
      if (file.slice(0, left.length) !== left) return null;
      return exterior + file.slice(left.length - 1);
    })
    .filter((result) => result);

  if (found.length >= 2) throw new Error('UNEXPECTED-00');
  if (found.length === 0) return null;
  return found[0];
}

function readdirMountpoints(path_) {
  return mountpoints
    .filter(({ interior }) => {
      if (isRegExp(interior)) return interior.test(path_);
      return path.dirname(interior) === path_;
    })
    .map(({ interior, exterior }) => {
      if (isRegExp(interior)) return path_.replace(interior, exterior);
      return path.basename(interior);
    });
}

function translate(f) {
  const result = insideMountpoint(f);
  if (!result) throw new Error('UNEXPECTED-05');
  return result;
}

function cloneArgs(args_) {
  return Array.prototype.slice.call(args_);
}

function translateNth(args_, index, f) {
  const args = cloneArgs(args_);
  args[index] = translate(f);
  return args;
}

function createMountpoint(interior, exterior) {
  // TODO validate
  mountpoints.push({ interior, exterior });
}

const DEFAULT_COPY_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
function copyInChunks(
  source,
  target,
  chunkSize = DEFAULT_COPY_CHUNK_SIZE,
  fs_ = fs
) {
  const sourceFile = fs_.openSync(source, 'r');
  const targetFile = fs_.openSync(target, 'w');

  let bytesRead = 1;
  while (bytesRead > 0) {
    const buffer = Buffer.alloc(chunkSize);
    bytesRead = fs_.readSync(sourceFile, buffer, 0, chunkSize);
    fs_.writeSync(targetFile, buffer, 0, bytesRead);
  }

  fs_.closeSync(sourceFile);
  fs_.closeSync(targetFile);
}

// TODO: replace this with fs.cpSync when we drop Node < 16
function copyFolderRecursiveSync(source, target) {
  // Build target folder
  const targetFolder = path.join(target, path.basename(source));

  // Check if target folder needs to be created or integrated
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);

    for (const file of files) {
      // Build source name
      const curSource = path.join(source, file);

      // Call this function recursively as long as source is a directory
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        // Current source is a file, it must be available on the real filesystem
        // instead of the virtual snapshot file system to load it by process.dlopen.
        //
        // Before we try to copy we do some checks.
        // See https://github.com/vercel/pkg/issues/1589 for more details.

        // Build target file name
        const curTarget = path.join(targetFolder, path.basename(curSource));

        if (fs.existsSync(curTarget)) {
          // Target file already exists, read source and target file...
          const curSourceContent = fs.readFileSync(curSource, {
            encoding: 'binary',
          });
          const curTargetContent = fs.readFileSync(curTarget, {
            encoding: 'binary',
          });

          // ...and calculate checksum from source and target file
          const curSourceHash = createHash('sha256')
            .update(curSourceContent)
            .digest('hex');
          const curTargetHash = createHash('sha256')
            .update(curTargetContent)
            .digest('hex');

          // If checksums are equal then there is nothing to do here
          // ==> target already exists and is up-to-date
          if (curSourceHash === curTargetHash) {
            continue;
          }
        }

        // Target must be copied because it either does not exist or is outdated.
        // Due to the possibility that mutliple instances of this app start simultaneously,
        // the copy action might fail. Only one starting instance gets write access.
        //
        // We don't catch any error here because it does not make sense to go ahead and to
        // try to load the file while another instance has not yet finished the copy action.
        // If the app start fails then the user should try to start the app later again.
        // Unfortunately, we cannot implement delayed retries ourselves because process.dlopen
        // is a synchronous function, promises are not supported.
        fs.copyFileSync(curSource, curTarget);
      }
    }
  }
}

function createDirRecursively(dir) {
  if (!fs.existsSync(dir)) {
    createDirRecursively(path.join(dir, '..'));
    fs.mkdirSync(dir);
  }
}

/*

// TODO move to some test

createMountpoint("d:\\snapshot\\countly\\plugins-ext", "d:\\deploy\\countly\\v16.02\\plugins-ext");

console.log(insideMountpoint("d:\\snapshot"));
console.log(insideMountpoint("d:\\snapshot\\"));
console.log(insideMountpoint("d:\\snapshot\\countly"));
console.log(insideMountpoint("d:\\snapshot\\countly\\"));
console.log(insideMountpoint("d:\\snapshot\\countly\\plugins-ext"));
console.log(insideMountpoint("d:\\snapshot\\countly\\plugins-ext\\"));
console.log(insideMountpoint("d:\\snapshot\\countly\\plugins-ext\\1234"));

console.log(translate("d:\\snapshot\\countly\\plugins-ext"));
console.log(translate("d:\\snapshot\\countly\\plugins-ext\\"));
console.log(translate("d:\\snapshot\\countly\\plugins-ext\\1234"));

console.log(translateNth([], 0, "d:\\snapshot\\countly\\plugins-ext"));
console.log(translateNth([], 0, "d:\\snapshot\\countly\\plugins-ext\\"));
console.log(translateNth([], 0, "d:\\snapshot\\countly\\plugins-ext\\1234"));

console.log(translateNth(["", "r+"], 0, "d:\\snapshot\\countly\\plugins-ext"));
console.log(translateNth(["", "rw"], 0, "d:\\snapshot\\countly\\plugins-ext\\"));
console.log(translateNth(["", "a+"], 0, "d:\\snapshot\\countly\\plugins-ext\\1234"));
*/
const dictRev = {};
const separator = '/';
let maxKey = Object.values(DICT).length;

function replace(k) {
  let v = DICT[k];
  // we have found a part of a missing file => let record for latter use
  if (v === undefined) {
    maxKey += 1;
    v = maxKey.toString(36);
    DICT[k] = v;
    dictRev[v] = k;
  }
  return v;
}

function findVirtualFileSystemKey(path_, slash) {
  const normalizedPath = normalizePath(path_);
  if (!DOCOMPRESS) {
    return normalizedPath;
  }
  const a = normalizedPath.split(slash).map(replace).join(separator);
  return a || normalizedPath;
}

Object.entries(DICT).forEach(([k, v]) => {
  dictRev[v] = k;
});

function toOriginal(fShort) {
  if (!DOCOMPRESS) {
    return fShort;
  }
  return fShort
    .split(separator)
    .map((x) => dictRev[x])
    .join(path.sep);
}

const symlinksEntries = Object.entries(SYMLINKS);

// separator for substitution depends on platform;
const sepsep = DOCOMPRESS ? separator : path.sep;

function findVirtualFileSystemKeyAndFollowLinks(path_) {
  let vfsKey = findVirtualFileSystemKey(path_, path.sep);
  let needToSubstitute = true;
  while (needToSubstitute) {
    needToSubstitute = false;
    for (const [k, v] of symlinksEntries) {
      if (vfsKey.startsWith(`${k}${sepsep}`) || vfsKey === k) {
        vfsKey = vfsKey.replace(k, v);
        needToSubstitute = true;
        break;
      }
    }
  }
  return vfsKey;
}

function realpathFromSnapshot(path_) {
  const realPath = toOriginal(findVirtualFileSystemKeyAndFollowLinks(path_));
  return realPath;
}

function findVirtualFileSystemEntry(path_) {
  const vfsKey = findVirtualFileSystemKeyAndFollowLinks(path_);
  return VIRTUAL_FILESYSTEM[vfsKey];
}

// /////////////////////////////////////////////////////////////////
// PROJECT /////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

const xpdn = path.dirname(EXECPATH);
const maxUplevels = xpdn.split(path.sep).length;
function projectToFilesystem(f) {
  const relatives = [];
  relatives.push(
    removeUplevels(path.relative(path.dirname(DEFAULT_ENTRYPOINT), f))
  );

  if (relatives[0].slice(0, 'node_modules'.length) === 'node_modules') {
    // one more relative without starting 'node_modules'
    relatives.push(relatives[0].slice('node_modules'.length + 1));
  }

  const uplevels = [];
  for (let i = 0, u = ''; i < maxUplevels; i += 1) {
    uplevels.push(u);
    u += '/..';
  }

  const results = [];
  uplevels.forEach((uplevel) => {
    relatives.forEach((relative) => {
      results.push(path.join(xpdn, uplevel, relative));
    });
  });
  return results;
}

function projectToNearby(f) {
  return path.join(xpdn, path.basename(f));
}
function findNativeAddonSyncFreeFromRequire(path_) {
  if (!insideSnapshot(path_)) throw new Error(`UNEXPECTED-10 ${path_}`);
  if (path_.slice(-5) !== '.node') return null; // leveldown.node.js
  // check nearby first to prevent .node tampering
  const projector = projectToNearby(path_);
  if (fs.existsSync(projector)) return projector;
  const projectors = projectToFilesystem(path_);
  for (let i = 0; i < projectors.length; i += 1) {
    if (fs.existsSync(projectors[i])) return projectors[i];
  }
  return null;
}

function findNativeAddonSyncUnderRequire(path_) {
  if (!FLAG_ENABLE_PROJECT) return null;
  return findNativeAddonSyncFreeFromRequire(path_);
}

// /////////////////////////////////////////////////////////////////
// FLOW UTILS //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

function asap(cb) {
  process.nextTick(cb);
}

function dezalgo(cb) {
  if (!cb) return cb;

  let sync = true;
  asap(() => {
    sync = false;
  });

  return function zalgoSafe() {
    const args = arguments;
    if (sync) {
      asap(() => {
        cb.apply(undefined, args);
      });
    } else {
      cb.apply(undefined, args);
    }
  };
}

function rethrow(error, arg) {
  if (error) throw error;
  return arg;
}

// /////////////////////////////////////////////////////////////////
// PAYLOAD /////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
if (typeof PAYLOAD_POSITION !== 'number' || typeof PAYLOAD_SIZE !== 'number') {
  throw new Error('MUST HAVE PAYLOAD');
}

function readPayload(buffer, offset, length, position, callback) {
  fs.read(
    EXECPATH_FD,
    buffer,
    offset,
    length,
    PAYLOAD_POSITION + position,
    callback
  );
}

function readPayloadSync(buffer, offset, length, position) {
  return fs.readSync(
    EXECPATH_FD,
    buffer,
    offset,
    length,
    PAYLOAD_POSITION + position
  );
}

function payloadCopyUni(
  source,
  target,
  targetStart,
  sourceStart,
  sourceEnd,
  cb
) {
  const cb2 = cb || rethrow;
  if (sourceStart >= source[1]) return cb2(null, 0);
  if (sourceEnd >= source[1]) [, sourceEnd] = source;
  const payloadPos = source[0] + sourceStart;
  const targetPos = targetStart;
  const targetEnd = targetStart + sourceEnd - sourceStart;
  if (cb) {
    readPayload(target, targetPos, targetEnd - targetPos, payloadPos, cb);
  } else {
    return readPayloadSync(
      target,
      targetPos,
      targetEnd - targetPos,
      payloadPos
    );
  }
}

function payloadCopyMany(source, target, targetStart, sourceStart, cb) {
  const payloadPos = source[0] + sourceStart;
  let targetPos = targetStart;
  const targetEnd = targetStart + source[1] - sourceStart;
  readPayload(
    target,
    targetPos,
    targetEnd - targetPos,
    payloadPos,
    (error, chunkSize) => {
      if (error) return cb(error);
      sourceStart += chunkSize;
      targetPos += chunkSize;
      if (chunkSize !== 0 && targetPos < targetEnd) {
        payloadCopyMany(source, target, targetPos, sourceStart, cb);
      } else {
        return cb();
      }
    }
  );
}

function payloadCopyManySync(source, target, targetStart, sourceStart) {
  let payloadPos = source[0] + sourceStart;
  let targetPos = targetStart;
  const targetEnd = targetStart + source[1] - sourceStart;
  while (true) {
    const chunkSize = readPayloadSync(
      target,
      targetPos,
      targetEnd - targetPos,
      payloadPos
    );
    payloadPos += chunkSize;
    targetPos += chunkSize;
    if (!(chunkSize !== 0 && targetPos < targetEnd)) break;
  }
}

const GZIP = 1;
const BROTLI = 2;
function payloadFile(pointer, cb) {
  const target = Buffer.alloc(pointer[1]);
  payloadCopyMany(pointer, target, 0, 0, (error) => {
    if (error) return cb(error);
    if (DOCOMPRESS === GZIP) {
      gunzip(target, (error2, target2) => {
        if (error2) return cb(error2);
        cb(null, target2);
      });
    } else if (DOCOMPRESS === BROTLI) {
      brotliDecompress(target, (error2, target2) => {
        if (error2) return cb(error2);
        cb(null, target2);
      });
    } else {
      return cb(null, target);
    }
  });
}

function payloadFileSync(pointer) {
  const target = Buffer.alloc(pointer[1]);
  payloadCopyManySync(pointer, target, 0, 0);
  if (DOCOMPRESS === GZIP) {
    const target1 = gunzipSync(target);
    return target1;
  }
  if (DOCOMPRESS === BROTLI) {
    const target1 = brotliDecompressSync(target);
    return target1;
  }
  return target;
}

// /////////////////////////////////////////////////////////////////
// SETUP PROCESS ///////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(() => {
  process.pkg = {};
  process.versions.pkg = '%VERSION%';
  process.pkg.mount = createMountpoint;
  process.pkg.entrypoint = ENTRYPOINT;
  process.pkg.defaultEntrypoint = DEFAULT_ENTRYPOINT;
})();

// /////////////////////////////////////////////////////////////////
// PATH.RESOLVE REPLACEMENT ////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(() => {
  process.pkg.path = {};
  process.pkg.path.resolve = function resolve() {
    const args = cloneArgs(arguments);
    args.unshift(path.dirname(ENTRYPOINT));
    return path.resolve.apply(path, args);
  };
})();

// /////////////////////////////////////////////////////////////////
// PATCH FS ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(() => {
  const ancestor = {
    openSync: fs.openSync,
    open: fs.open,
    readSync: fs.readSync,
    read: fs.read,
    writeSync: fs.writeSync,
    write: fs.write,
    closeSync: fs.closeSync,
    close: fs.close,
    readFileSync: fs.readFileSync,
    readFile: fs.readFile,
    // writeFileSync: fs.writeFileSync, // based on openSync/writeSync/closeSync
    // writeFile:     fs.writeFile, // based on open/write/close
    readdirSync: fs.readdirSync,
    readdir: fs.readdir,
    realpathSync: fs.realpathSync,
    realpath: fs.realpath,
    statSync: fs.statSync,
    stat: fs.stat,
    lstatSync: fs.lstatSync,
    lstat: fs.lstat,
    fstatSync: fs.fstatSync,
    fstat: fs.fstat,
    existsSync: fs.existsSync,
    exists: fs.exists,
    accessSync: fs.accessSync,
    access: fs.access,
    mkdirSync: fs.mkdirSync,
    mkdir: fs.mkdir,
    createReadStream: fs.createReadStream,
    copyFileSync: fs.copyFileSync,
    copyFile: fs.copyFile,
  };

  ancestor.realpathSync.native = fs.realpathSync;
  ancestor.realpath.native = fs.realpath;

  const windows = process.platform === 'win32';

  const docks = {};
  const ENOTDIR = windows ? 4052 : 20;
  const ENOENT = windows ? 4058 : 2;
  const EISDIR = windows ? 4068 : 21;

  function assertEncoding(encoding) {
    if (encoding && !Buffer.isEncoding(encoding)) {
      throw new Error(`Unknown encoding: ${encoding}`);
    }
  }

  function maybeCallback(args) {
    const cb = args[args.length - 1];
    return typeof cb === 'function' ? cb : rethrow;
  }

  function error_ENOENT(fileOrDirectory, path_) {
    const error = new Error(
      `${fileOrDirectory} '${stripSnapshot(path_)}' ` +
        `was not included into executable at compilation stage. ` +
        `Please recompile adding it as asset or script.`
    );
    error.errno = -ENOENT;
    error.code = 'ENOENT';
    error.path = path_;
    error.pkg = true;
    return error;
  }

  function error_EISDIR(path_) {
    const error = new Error('EISDIR: illegal operation on a directory, read');
    error.errno = -EISDIR;
    error.code = 'EISDIR';
    error.path = path_;
    error.pkg = true;
    return error;
  }

  function error_ENOTDIR(path_) {
    const error = new Error(`ENOTDIR: not a directory, scandir '${path_}'`);
    error.errno = -ENOTDIR;
    error.code = 'ENOTDIR';
    error.path = path_;
    error.pkg = true;
    return error;
  }

  // ///////////////////////////////////////////////////////////////
  // open //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function removeTemporaryFolderAndContent(folder) {
    if (!folder) return;
    if (NODE_VERSION_MAJOR <= 14) {
      if (NODE_VERSION_MAJOR <= 10) {
        // folder must be empty
        for (const f of fs.readdirSync(folder)) {
          fs.unlinkSync(path.join(folder, f));
        }
        fs.rmdirSync(folder);
      } else {
        fs.rmdirSync(folder, { recursive: true });
      }
    } else {
      fs.rmSync(folder, { recursive: true });
    }
  }
  const temporaryFiles = {};
  const os = require('os');
  let tmpFolder = '';
  process.on('beforeExit', () => {
    removeTemporaryFolderAndContent(tmpFolder);
  });
  function deflateSync(snapshotFilename) {
    if (!tmpFolder) {
      tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-'));
    }
    const content = fs.readFileSync(snapshotFilename, { encoding: 'binary' });
    // content is already unzipped !

    const hash = createHash('sha256').update(content).digest('hex');
    const fName = path.join(tmpFolder, hash);
    fs.writeFileSync(fName, content, 'binary');
    return fName;
  }

  const uncompressExternally = function uncompressExternally(dock) {
    if (!dock.externalFilename) {
      const snapshotFilename = dock.path;
      let t = temporaryFiles[snapshotFilename];
      if (!t) {
        const tmpFile = deflateSync(snapshotFilename);
        t = { tmpFile };
        temporaryFiles[snapshotFilename] = t;
      }
      dock.externalFilename = t.tmpFile;
    }
    return dock.externalFilename;
  };

  function uncompressExternallyPath(path_) {
    const entity = findVirtualFileSystemEntry(path_);
    const dock = { path: path_, entity, position: 0 };
    return uncompressExternally(dock);
  }

  function uncompressExternallyAndOpen(dock) {
    const externalFile = uncompressExternally(dock);
    const fd = fs.openSync(externalFile, 'r');
    return fd;
  }

  function openFromSnapshot(path_, uncompress, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(path_);
    if (!entity) return cb2(error_ENOENT('File or directory', path_));
    const dock = { path: path_, entity, position: 0 };

    const nullDevice = windows ? '\\\\.\\NUL' : '/dev/null';
    if (cb) {
      ancestor.open.call(fs, nullDevice, 'r', (error, fd) => {
        if (error) return cb(error);
        if (DOCOMPRESS) {
          dock._externalFile = uncompressExternallyAndOpen(dock);
        }
        docks[fd] = dock;
        cb(null, fd);
      });
    } else {
      const fd = ancestor.openSync.call(fs, nullDevice, 'r');
      if (DOCOMPRESS) {
        dock._externalFile = uncompressExternallyAndOpen(dock);
      }
      docks[fd] = dock;
      return fd;
    }
  }

  fs.createReadStream = function createReadStream(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.createReadStream.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.createReadStream.apply(
        fs,
        translateNth(arguments, 0, path_)
      );
    }
    const stream = ancestor.createReadStream.apply(fs, arguments);
    return stream;
  };
  fs.openSync = function openSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.openSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.openSync.apply(fs, translateNth(arguments, 0, path_));
    }
    return openFromSnapshot(path_, DOCOMPRESS);
  };

  fs.open = function open(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.open.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.open.apply(fs, translateNth(arguments, 0, path_));
    }
    const callback = dezalgo(maybeCallback(arguments));
    openFromSnapshot(path_, DOCOMPRESS, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // read //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readFromSnapshotSub(
    entityContent,
    dock,
    buffer,
    offset,
    length,
    position,
    cb
  ) {
    if (DOCOMPRESS) {
      // note: source contains info about a compressed file and source[1] does not reflect
      //       the actual size of the file.
      //       so random access reading of a compressed virtual file, requires read from
      //       an externally decompressed file
      if (!dock._externalFile) {
        dock._externalFile = uncompressExternallyAndOpen(dock);
      } else {
        position = position === undefined ? 0 : position;
      }
      return fs.read(dock._externalFile, buffer, offset, length, position, cb);
    }
    let p;
    if (position !== null && position !== undefined) {
      p = position;
    } else {
      p = dock.position;
    }
    if (cb) {
      payloadCopyUni(
        entityContent,
        buffer,
        offset,
        p,
        p + length,
        (error, bytesRead, buffer2) => {
          if (error) return cb(error);
          dock.position = p + bytesRead;
          cb(null, bytesRead, buffer2);
        }
      );
    } else {
      const bytesRead = payloadCopyUni(
        entityContent,
        buffer,
        offset,
        p,
        p + length
      );
      dock.position = p + bytesRead;
      return bytesRead;
    }
  }

  function readFromSnapshot(fd, buffer, offset, length, position, cb) {
    const dock = docks[fd];

    if (dock && dock._externalFile) {
      if (cb) {
        return ancestor.read(
          dock._externalFile,
          buffer,
          offset,
          length,
          position,
          cb
        );
      }
      return ancestor.readSync(
        dock._externalFile,
        buffer,
        offset,
        length,
        position
      );
    }
    const cb2 = cb || rethrow;
    if (offset < 0 && NODE_VERSION_MAJOR >= 14)
      return cb2(
        new Error(
          `The value of "offset" is out of range. It must be >= 0. Received ${offset}`
        )
      );
    if (offset < 0 && NODE_VERSION_MAJOR >= 10)
      return cb2(
        new Error(
          `The value of "offset" is out of range. It must be >= 0 && <= ${buffer.length.toString()}. Received ${offset}`
        )
      );
    if (offset < 0) return cb2(new Error('Offset is out of bounds'));
    if (offset >= buffer.length) return cb2(null, 0);
    if (offset + length > buffer.length && NODE_VERSION_MAJOR >= 14)
      return cb2(
        new Error(
          `The value of "length" is out of range. It must be <= ${(
            buffer.length - offset
          ).toString()}. Received ${length.toString()}`
        )
      );
    if (offset + length > buffer.length && NODE_VERSION_MAJOR >= 10)
      return cb2(
        new Error(
          `The value of "length" is out of range. It must be >= 0 && <= ${(
            buffer.length - offset
          ).toString()}. Received ${length.toString()}`
        )
      );
    if (offset + length > buffer.length)
      return cb2(new Error('Length extends beyond buffer'));

    const { entity } = dock;
    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) return cb2(error_EISDIR(dock.path));
    const entityContent = entity[STORE_CONTENT];
    if (entityContent)
      return readFromSnapshotSub(
        entityContent,
        dock,
        buffer,
        offset,
        length,
        position,
        cb
      );
    return cb2(new Error('UNEXPECTED-15'));
  }

  fs.readSync = function readSync(fd, buffer, offset, length, position) {
    if (!docks[fd]) {
      return ancestor.readSync.apply(fs, arguments);
    }
    return readFromSnapshot(fd, buffer, offset, length, position);
  };

  fs.read = function read(fd, buffer, offset, length, position) {
    if (!docks[fd]) {
      return ancestor.read.apply(fs, arguments);
    }

    const callback = dezalgo(maybeCallback(arguments));
    readFromSnapshot(fd, buffer, offset, length, position, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // write /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function writeToSnapshot(cb) {
    const cb2 = cb || rethrow;
    return cb2(new Error('Cannot write to packaged file'));
  }

  fs.writeSync = function writeSync(fd) {
    if (!docks[fd]) {
      return ancestor.writeSync.apply(fs, arguments);
    }

    return writeToSnapshot();
  };

  fs.write = function write(fd) {
    if (!docks[fd]) {
      return ancestor.write.apply(fs, arguments);
    }
    const callback = dezalgo(maybeCallback(arguments));
    return writeToSnapshot(callback);
  };

  // ///////////////////////////////////////////////////////////////
  // close /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  const closeFromSnapshot = (fd, cb) => {
    const dock = docks[fd];
    if (dock._externalFile) {
      ancestor.closeSync(dock._externalFile);
      dock._externalFile = undefined;
    }
    delete docks[fd];
    if (cb) {
      ancestor.close.call(fs, fd, cb);
    } else {
      return ancestor.closeSync.call(fs, fd);
    }
  };

  fs.closeSync = function closeSync(fd) {
    if (!docks[fd]) {
      return ancestor.closeSync.apply(fs, arguments);
    }
    return closeFromSnapshot(fd);
  };

  fs.close = function close(fd) {
    if (!docks[fd]) {
      return ancestor.close.apply(fs, arguments);
    }

    const callback = dezalgo(maybeCallback(arguments));
    closeFromSnapshot(fd, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // readFile //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readFileOptions(options, hasCallback) {
    if (!options || (hasCallback && typeof options === 'function')) {
      return { encoding: null, flag: 'r' };
    }
    if (typeof options === 'string') {
      return { encoding: options, flag: 'r' };
    }
    if (typeof options === 'object') {
      return options;
    }
    return null;
  }

  function readFileFromSnapshotSub(entityContent, cb) {
    if (cb) {
      payloadFile(entityContent, cb);
    } else {
      return payloadFileSync(entityContent);
    }
  }

  function readFileFromSnapshot(path_, cb) {
    const cb2 = cb || rethrow;

    const entity = findVirtualFileSystemEntry(path_);
    if (!entity) return cb2(error_ENOENT('File', path_));

    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) return cb2(error_EISDIR(path_));

    const entityContent = entity[STORE_CONTENT];
    if (entityContent) return readFileFromSnapshotSub(entityContent, cb);

    const entityBlob = entity[STORE_BLOB];
    if (entityBlob) {
      return cb2(null, Buffer.from('source-code-not-available'));
    }
    // why return empty buffer?
    // otherwise this error will arise:
    // Error: UNEXPECTED-20
    //     at readFileFromSnapshot (e:0)
    //     at Object.fs.readFileSync (e:0)
    //     at Object.Module._extensions..js (module.js:421:20)
    //     at Module.load (module.js:357:32)
    //     at Function.Module._load (module.js:314:12)
    //     at Function.Module.runMain (e:0)
    //     at startup (node.js:140:18)
    //     at node.js:1001:3

    return cb2(new Error('UNEXPECTED-20'));
  }

  fs.readFileSync = function readFileSync(path_, options_) {
    if (path_ === 'dirty-hack-for-testing-purposes') {
      return path_;
    }

    if (!insideSnapshot(path_)) {
      return ancestor.readFileSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.readFileSync.apply(fs, translateNth(arguments, 0, path_));
    }

    const options = readFileOptions(options_, false);

    if (!options) {
      return ancestor.readFileSync.apply(fs, arguments);
    }

    const { encoding } = options;
    assertEncoding(encoding);

    let buffer = readFileFromSnapshot(path_);
    if (encoding) buffer = buffer.toString(encoding);
    return buffer;
  };

  fs.readFile = function readFile(path_, options_) {
    if (!insideSnapshot(path_)) {
      return ancestor.readFile.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.readFile.apply(fs, translateNth(arguments, 0, path_));
    }

    const options = readFileOptions(options_, true);

    if (!options) {
      return ancestor.readFile.apply(fs, arguments);
    }

    const { encoding } = options;
    assertEncoding(encoding);

    const callback = dezalgo(maybeCallback(arguments));
    readFileFromSnapshot(path_, (error, buffer) => {
      if (error) return callback(error);
      if (encoding) buffer = buffer.toString(encoding);
      callback(null, buffer);
    });
  };

  fs.copyFile = function copyFile(src, dest, flags, callback) {
    if (!insideSnapshot(path.resolve(src))) {
      ancestor.copyFile(src, dest, flags, callback);
      return;
    }
    if (typeof flags === 'function') {
      callback = flags;
      flags = 0;
    } else if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    function _streamCopy() {
      fs.createReadStream(src)
        .on('error', callback)
        .pipe(fs.createWriteStream(dest))
        .on('error', callback)
        .on('finish', callback);
    }

    if (flags & fs.constants.COPYFILE_EXCL) {
      fs.stat(dest, (statError) => {
        if (!statError) {
          callback(
            Object.assign(new Error('File already exists'), {
              code: 'EEXIST',
            })
          );
          return;
        }
        if (statError.code !== 'ENOENT') {
          callback(statError);
          return;
        }
        _streamCopy();
      });
    } else {
      _streamCopy();
    }
  };

  fs.copyFileSync = function copyFileSync(src, dest, flags) {
    if (!insideSnapshot(path.resolve(src))) {
      ancestor.copyFileSync(src, dest, flags);
      return;
    }

    if (flags & fs.constants.COPYFILE_EXCL) {
      try {
        fs.statSync(dest);
      } catch (statError) {
        if (statError.code !== 'ENOENT') throw statError;
        copyInChunks(src, dest, DEFAULT_COPY_CHUNK_SIZE, fs);
        return;
      }

      throw Object.assign(new Error('File already exists'), { code: 'EEXIST' });
    }
    copyInChunks(src, dest, DEFAULT_COPY_CHUNK_SIZE, fs);
  };

  // ///////////////////////////////////////////////////////////////
  // writeFile /////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  // writeFileSync based on openSync/writeSync/closeSync
  // writeFile based on open/write/close

  // ///////////////////////////////////////////////////////////////
  // readdir ///////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readdirOptions(options, hasCallback) {
    if (!options || (hasCallback && typeof options === 'function')) {
      return { encoding: null };
    }
    if (typeof options === 'string') {
      return { encoding: options };
    }
    if (typeof options === 'object') {
      return options;
    }
    return null;
  }

  function Dirent(name, type) {
    this.name = name;
    this.type = type;
  }

  Dirent.prototype.isDirectory = function isDirectory() {
    return this.type === 2;
  };

  Dirent.prototype.isFile = function isFile() {
    return this.type === 1;
  };

  const noop = () => false;
  Dirent.prototype.isBlockDevice = noop;
  Dirent.prototype.isCharacterDevice = noop;
  Dirent.prototype.isSocket = noop;
  Dirent.prototype.isFIFO = noop;

  Dirent.prototype.isSymbolicLink = (fileOrFolderName) =>
    Boolean(SYMLINKS[fileOrFolderName]);

  function getFileTypes(path_, entries) {
    return entries.map((entry) => {
      const ff = path.join(path_, entry);
      const entity = findVirtualFileSystemEntry(ff);
      if (!entity) return undefined;
      if (entity[STORE_BLOB] || entity[STORE_CONTENT])
        return new Dirent(entry, 1);
      if (entity[STORE_LINKS]) return new Dirent(entry, 2);
      throw new Error('UNEXPECTED-24');
    });
  }

  function readdirRoot(path_, options, cb) {
    function addSnapshot(entries) {
      if (options && options.withFileTypes) {
        entries.push(new Dirent('snapshot', 2));
      } else {
        entries.push('snapshot');
      }
    }

    if (cb) {
      ancestor.readdir(path_, options, (error, entries) => {
        if (error) return cb(error);
        addSnapshot(entries);
        cb(null, entries);
      });
    } else {
      const entries = ancestor.readdirSync(path_, options);
      addSnapshot(entries);
      return entries;
    }
  }

  function readdirFromSnapshotSub(entityLinks, path_, cb) {
    if (cb) {
      payloadFile(entityLinks, (error, buffer) => {
        if (error) return cb(error);
        cb(null, JSON.parse(buffer).concat(readdirMountpoints(path_)));
      });
    } else {
      const buffer = payloadFileSync(entityLinks);
      return JSON.parse(buffer).concat(readdirMountpoints(path_));
    }
  }

  function readdirFromSnapshot(path_, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(path_);

    if (!entity) {
      return cb2(error_ENOENT('Directory', path_));
    }

    const entityBlob = entity[STORE_BLOB];
    if (entityBlob) {
      return cb2(error_ENOTDIR(path_));
    }

    const entityContent = entity[STORE_CONTENT];
    if (entityContent) {
      return cb2(error_ENOTDIR(path_));
    }

    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) {
      return readdirFromSnapshotSub(entityLinks, path_, cb);
    }
    return cb2(new Error('UNEXPECTED-25'));
  }

  fs.readdirSync = function readdirSync(path_, options_) {
    const isRoot = isRootPath(path_);

    if (!insideSnapshot(path_) && !isRoot) {
      return ancestor.readdirSync.apply(fs, arguments);
    }

    if (insideMountpoint(path_)) {
      return ancestor.readdirSync.apply(fs, translateNth(arguments, 0, path_));
    }

    const options = readdirOptions(options_, false);

    if (isRoot) {
      return readdirRoot(path_, options);
    }

    if (!options) {
      return ancestor.readdirSync.apply(fs, arguments);
    }

    let entries = readdirFromSnapshot(path_);
    if (options.withFileTypes) entries = getFileTypes(path_, entries);
    return entries;
  };

  fs.readdir = function readdir(path_, options_) {
    const isRoot = isRootPath(path_);

    if (!insideSnapshot(path_) && !isRoot) {
      return ancestor.readdir.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.readdir.apply(fs, translateNth(arguments, 0, path_));
    }

    const options = readdirOptions(options_, true);
    const callback = dezalgo(maybeCallback(arguments));

    if (isRoot) {
      return readdirRoot(path_, options, callback);
    }

    if (!options) {
      return ancestor.readdir.apply(fs, arguments);
    }

    readdirFromSnapshot(path_, (error, entries) => {
      if (error) return callback(error);
      if (options.withFileTypes) entries = getFileTypes(path_, entries);
      callback(null, entries);
    });
  };

  // ///////////////////////////////////////////////////////////////
  // realpath //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  fs.realpathSync = function realpathSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.realpathSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      // app should not know real file name
      return path_;
    }

    const realPath = realpathFromSnapshot(path_);
    return realPath;
  };

  fs.realpath = function realpath(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.realpath.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      // app should not know real file name
      return path_;
    }

    const callback = dezalgo(maybeCallback(arguments));
    callback(null, realpathFromSnapshot(path_));
  };

  fs.realpathSync.native = fs.realpathSync;
  fs.realpath.native = fs.realpath;

  // ///////////////////////////////////////////////////////////////
  // stat //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function restore(s) {
    s.blksize = 4096;
    s.blocks = 0;
    s.dev = 0;
    s.gid = 20;
    s.ino = 0;
    s.nlink = 0;
    s.rdev = 0;
    s.uid = 500;

    s.atime = new Date(EXECSTAT.atime);
    s.mtime = new Date(EXECSTAT.mtime);
    s.ctime = new Date(EXECSTAT.ctime);
    s.birthtime = new Date(EXECSTAT.birthtime);

    s.atimeMs = EXECSTAT.atimeMs;
    s.mtimeMs = EXECSTAT.mtimeMs;
    s.ctimeMs = EXECSTAT.ctimeMs;
    s.birthtimeMs = EXECSTAT.birthtimeMs;

    const { isFileValue } = s;
    const { isDirectoryValue } = s;
    const { isSocketValue } = s;
    const { isSymbolicLinkValue } = s;

    delete s.isFileValue;
    delete s.isDirectoryValue;
    delete s.isSocketValue;
    delete s.isSymbolicLinkValue;

    s.isFile = function isFile() {
      return isFileValue;
    };
    s.isDirectory = function isDirectory() {
      return isDirectoryValue;
    };
    s.isSocket = function isSocket() {
      return isSocketValue;
    };
    s.isSymbolicLink = function isSymbolicLink() {
      return isSymbolicLinkValue;
    };
    s.isFIFO = function isFIFO() {
      return false;
    };

    return s;
  }

  function findNativeAddonForStat(path_, cb) {
    const cb2 = cb || rethrow;
    const foundPath = findNativeAddonSyncUnderRequire(path_);
    if (!foundPath) return cb2(error_ENOENT('File or directory', path_));
    if (cb) {
      ancestor.stat.call(fs, foundPath, cb);
    } else {
      return ancestor.statSync.call(fs, foundPath);
    }
  }

  function statFromSnapshotSub(entityStat, cb) {
    if (cb) {
      payloadFile(entityStat, (error, buffer) => {
        if (error) return cb(error);
        cb(null, restore(JSON.parse(buffer)));
      });
    } else {
      const buffer = payloadFileSync(entityStat);
      return restore(JSON.parse(buffer));
    }
  }

  function statFromSnapshot(path_, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(path_);
    if (!entity) return findNativeAddonForStat(path_, cb);
    const entityStat = entity[STORE_STAT];
    if (entityStat) return statFromSnapshotSub(entityStat, cb);
    return cb2(new Error('UNEXPECTED-35'));
  }

  fs.statSync = function statSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.statSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.statSync.apply(fs, translateNth(arguments, 0, path_));
    }

    return statFromSnapshot(path_);
  };

  fs.stat = function stat(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.stat.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.stat.apply(fs, translateNth(arguments, 0, path_));
    }

    const callback = dezalgo(maybeCallback(arguments));
    statFromSnapshot(path_, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // lstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  fs.lstatSync = function lstatSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.lstatSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.lstatSync.apply(fs, translateNth(arguments, 0, path_));
    }

    return statFromSnapshot(path_);
  };

  fs.lstat = function lstat(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.lstat.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.lstat.apply(fs, translateNth(arguments, 0, path_));
    }

    const callback = dezalgo(maybeCallback(arguments));
    statFromSnapshot(path_, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // fstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function fstatFromSnapshot(fd, cb) {
    const cb2 = cb || rethrow;
    const { entity } = docks[fd];
    const entityStat = entity[STORE_STAT];
    if (entityStat) return statFromSnapshotSub(entityStat, cb);
    return cb2(new Error('UNEXPECTED-40'));
  }

  fs.fstatSync = function fstatSync(fd) {
    if (!docks[fd]) {
      return ancestor.fstatSync.apply(fs, arguments);
    }

    return fstatFromSnapshot(fd);
  };

  fs.fstat = function fstat(fd) {
    if (!docks[fd]) {
      return ancestor.fstat.apply(fs, arguments);
    }

    const callback = dezalgo(maybeCallback(arguments));
    fstatFromSnapshot(fd, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // exists ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function findNativeAddonForExists(path_) {
    const foundPath = findNativeAddonSyncFreeFromRequire(path_);
    if (!foundPath) return false;
    return ancestor.existsSync.call(fs, foundPath);
  }

  function existsFromSnapshot(path_) {
    const entity = findVirtualFileSystemEntry(path_);
    if (!entity) return findNativeAddonForExists(path_);
    return true;
  }

  fs.existsSync = function existsSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.existsSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.existsSync.apply(fs, translateNth(arguments, 0, path_));
    }

    return existsFromSnapshot(path_);
  };

  fs.exists = function exists(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.exists.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.exists.apply(fs, translateNth(arguments, 0, path_));
    }

    const callback = dezalgo(maybeCallback(arguments));
    callback(existsFromSnapshot(path_));
  };

  // ///////////////////////////////////////////////////////////////
  // access ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function accessFromSnapshot(path_, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(path_);
    if (!entity) return cb2(error_ENOENT('File or directory', path_));
    return cb2(null, undefined);
  }

  fs.accessSync = function accessSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.accessSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.accessSync.apply(fs, translateNth(arguments, 0, path_));
    }

    return accessFromSnapshot(path_);
  };

  fs.access = function access(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.access.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.access.apply(fs, translateNth(arguments, 0, path_));
    }

    const callback = dezalgo(maybeCallback(arguments));
    accessFromSnapshot(path_, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // mkdir /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function mkdirFailInSnapshot(path_, cb) {
    const cb2 = cb || rethrow;
    return cb2(
      new Error('Cannot mkdir in a snapshot. Try mountpoints instead.')
    );
  }

  fs.mkdirSync = function mkdirSync(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.mkdirSync.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.mkdirSync.apply(fs, translateNth(arguments, 0, path_));
    }

    return mkdirFailInSnapshot(path_);
  };

  fs.mkdir = function mkdir(path_) {
    if (!insideSnapshot(path_)) {
      return ancestor.mkdir.apply(fs, arguments);
    }
    if (insideMountpoint(path_)) {
      return ancestor.mkdir.apply(fs, translateNth(arguments, 0, path_));
    }

    mkdirFailInSnapshot(path_, dezalgo(maybeCallback(arguments)));
  };

  // ///////////////////////////////////////////////////////////////
  // promises ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  if (fs.promises !== undefined) {
    const ancestor_promises = {
      open: fs.promises.open,
      read: fs.promises.read,
      write: fs.promises.write,
      readFile: fs.promises.readFile,
      readdir: fs.promises.readdir,
      realpath: fs.promises.realpath,
      stat: fs.promises.stat,
      lstat: fs.promises.lstat,
      fstat: fs.promises.fstat,
      access: fs.promises.access,
      copyFile: fs.promises.copyFile,
    };

    fs.promises.open = async function open(path_) {
      if (!insideSnapshot(path_)) {
        return ancestor_promises.open.apply(this, arguments);
      }
      if (insideMountpoint(path_)) {
        return ancestor_promises.open.apply(
          this,
          translateNth(arguments, 0, path_)
        );
      }
      const externalFile = uncompressExternallyPath(path_);
      arguments[0] = externalFile;
      const fd = await ancestor_promises.open.apply(this, arguments);
      if (typeof fd === 'object') {
        fd._pkg = { externalFile, file: path_ };
      }
      return fd;
    };
    fs.promises.readFile = async function readFile(path_) {
      if (!insideSnapshot(path_)) {
        return ancestor_promises.readFile.apply(this, arguments);
      }
      if (insideMountpoint(path_)) {
        return ancestor_promises.readFile.apply(
          this,
          translateNth(arguments, 0, path_)
        );
      }
      const externalFile = uncompressExternallyPath(path_);
      arguments[0] = externalFile;
      return ancestor_promises.readFile.apply(this, arguments);
    };

    fs.promises.write = async function write(fd) {
      if (fd._pkg) {
        throw new Error(
          `[PKG] Cannot write into Snapshot file : ${fd._pkg.file}`
        );
      }
      return ancestor_promises.write.apply(this, arguments);
    };

    // this one use promisify on purpose
    fs.promises.readdir = util.promisify(fs.readdir);
    fs.promises.copyFile = util.promisify(fs.copyFile);
    fs.promises.stat = util.promisify(fs.stat);
    fs.promises.lstat = util.promisify(fs.lstat);

    /*
    fs.promises.read = util.promisify(fs.read);
    fs.promises.realpath = util.promisify(fs.realpath);
    fs.promises.fstat = util.promisify(fs.fstat);
    fs.promises.access = util.promisify(fs.access);
  */
  }

  // ///////////////////////////////////////////////////////////////
  // INTERNAL //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function makeLong(f) {
    return path._makeLong(f);
  }

  function revertMakingLong(f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  function findNativeAddonForInternalModuleStat(path_) {
    const fNative = findNativeAddonSyncUnderRequire(path_);
    if (!fNative) return -ENOENT;
    return process.binding('fs').internalModuleStat(makeLong(fNative));
  }

  fs.internalModuleStat = function internalModuleStat(long) {
    // from node comments:
    // Used to speed up module loading. Returns 0 if the path refers to
    // a file, 1 when it's a directory or < 0 on error (usually -ENOENT).
    // The speedup comes from not creating thousands of Stat and Error objects.

    const path_ = revertMakingLong(long);

    if (!insideSnapshot(path_)) {
      return process.binding('fs').internalModuleStat(long);
    }
    if (insideMountpoint(path_)) {
      return process
        .binding('fs')
        .internalModuleStat(makeLong(translate(path_)));
    }

    const entity = findVirtualFileSystemEntry(path_);

    if (!entity) {
      return findNativeAddonForInternalModuleStat(path_);
    }

    const entityBlob = entity[STORE_BLOB];
    if (entityBlob) {
      return 0;
    }

    const entityContent = entity[STORE_CONTENT];
    if (entityContent) {
      return 0;
    }

    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) {
      return 1;
    }

    return -ENOENT;
  };

  fs.internalModuleReadJSON = function internalModuleReadJSON(long) {
    // from node comments:
    // Used to speed up module loading. Returns the contents of the file as
    // a string or undefined when the file cannot be opened. The speedup
    // comes from not creating Error objects on failure.
    // For newer node versions (after https://github.com/nodejs/node/pull/33229 ):
    // Returns an array [string, boolean].
    //
    const returnArray =
      (NODE_VERSION_MAJOR === 12 && NODE_VERSION_MINOR >= 19) ||
      (NODE_VERSION_MAJOR === 14 && NODE_VERSION_MINOR >= 5) ||
      NODE_VERSION_MAJOR >= 15;

    const path_ = revertMakingLong(long);
    const bindingFs = process.binding('fs');
    const readFile = (
      bindingFs.internalModuleReadFile || bindingFs.internalModuleReadJSON
    ).bind(bindingFs);
    if (!insideSnapshot(path_)) {
      return readFile(long);
    }
    if (insideMountpoint(path_)) {
      return readFile(makeLong(translate(path_)));
    }

    const entity = findVirtualFileSystemEntry(path_);

    if (!entity) {
      return returnArray ? [undefined, false] : undefined;
    }

    const entityContent = entity[STORE_CONTENT];
    if (!entityContent) {
      return returnArray ? [undefined, false] : undefined;
    }
    return returnArray
      ? [payloadFileSync(entityContent).toString(), true]
      : payloadFileSync(entityContent).toString();
  };

  fs.internalModuleReadFile = fs.internalModuleReadJSON;
})();

// /////////////////////////////////////////////////////////////////
// PATCH MODULE ////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(() => {
  const ancestor = {
    require: Module.prototype.require,
    _compile: Module.prototype._compile,
    _resolveFilename: Module._resolveFilename,
    runMain: Module.runMain,
  };

  Module.prototype.require = function require(path_) {
    try {
      return ancestor.require.apply(this, arguments);
    } catch (error) {
      if (
        (error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND') &&
        !insideSnapshot(path_) &&
        !path.isAbsolute(path_)
      ) {
        if (!error.pkg) {
          error.pkg = true;
          error.message +=
            '\n' +
            '1) If you want to compile the package/file into ' +
            'executable, please pay attention to compilation ' +
            "warnings and specify a literal in 'require' call. " +
            "2) If you don't want to compile the package/file " +
            "into executable and want to 'require' it from " +
            'filesystem (likely plugin), specify an absolute ' +
            "path in 'require' call using process.cwd() or " +
            'process.execPath.';
        }
      }
      throw error;
    }
  };

  let im;
  let makeRequireFunction;

  if (NODE_VERSION_MAJOR <= 9) {
    im = require('internal/module');
    makeRequireFunction = im.makeRequireFunction;
  } else {
    im = require('internal/modules/cjs/helpers');
    makeRequireFunction = im.makeRequireFunction;
    // TODO esm modules along with cjs
  }

  Module.prototype._compile = function _compile(content, filename_) {
    if (!insideSnapshot(filename_)) {
      return ancestor._compile.apply(this, arguments);
    }
    if (insideMountpoint(filename_)) {
      // DON'T TRANSLATE! otherwise __dirname gets real name
      return ancestor._compile.apply(this, arguments);
    }

    const entity = findVirtualFileSystemEntry(filename_);

    if (!entity) {
      // let user try to "_compile" a packaged file
      return ancestor._compile.apply(this, arguments);
    }

    const entityBlob = entity[STORE_BLOB];
    const entityContent = entity[STORE_CONTENT];

    if (entityBlob) {
      const options = {
        filename: filename_,
        lineOffset: 0,
        displayErrors: true,
        cachedData: payloadFileSync(entityBlob),
        sourceless: !entityContent,
      };

      const code = entityContent
        ? Module.wrap(payloadFileSync(entityContent))
        : undefined;

      const script = new Script(code, options);
      const wrapper = script.runInThisContext(options);
      if (!wrapper) process.exit(4); // for example VERSION_MISMATCH
      const dirname = path.dirname(filename_);
      const rqfn = makeRequireFunction(this);
      const args = [this.exports, rqfn, this, filename_, dirname];
      return wrapper.apply(this.exports, args);
    }

    if (entityContent) {
      if (entityBlob) throw new Error('UNEXPECTED-50');
      // content is already in utf8 and without BOM (that is expected
      // by stock _compile), but entityContent is still a Buffer
      return ancestor._compile.apply(this, arguments);
    }

    throw new Error('UNEXPECTED-55');
  };

  Module._resolveFilename = function _resolveFilename() {
    let filename;
    let flagWasOn = false;
    try {
      filename = ancestor._resolveFilename.apply(this, arguments);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;

      FLAG_ENABLE_PROJECT = true;
      const savePathCache = Module._pathCache;
      Module._pathCache = Object.create(null);
      try {
        filename = ancestor._resolveFilename.apply(this, arguments);
        flagWasOn = true;
      } finally {
        Module._pathCache = savePathCache;
        FLAG_ENABLE_PROJECT = false;
      }
    }
    if (!insideSnapshot(filename)) {
      return filename;
    }
    if (insideMountpoint(filename)) {
      return filename;
    }

    if (flagWasOn) {
      FLAG_ENABLE_PROJECT = true;
      try {
        const found = findNativeAddonSyncUnderRequire(filename);
        if (found) filename = found;
      } finally {
        FLAG_ENABLE_PROJECT = false;
      }
    }

    return filename;
  };

  Module.runMain = function runMain() {
    Module._load(ENTRYPOINT, null, true);
    process._tickCallback();
  };
})();

// /////////////////////////////////////////////////////////////////
// PATCH CHILD_PROCESS /////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  const ancestor = {
    spawn: childProcess.spawn,
    spawnSync: childProcess.spawnSync,
    execFile: childProcess.execFile,
    execFileSync: childProcess.execFileSync,
    exec: childProcess.exec,
    execSync: childProcess.execSync,
  };

  function setOptsEnv(args) {
    let pos = args.length - 1;
    if (typeof args[pos] === 'function') pos -= 1;
    if (typeof args[pos] !== 'object' || Array.isArray(args[pos])) {
      pos += 1;
      args.splice(pos, 0, {});
    }
    const opts = args[pos];
    if (!opts.env) opts.env = _extend({}, process.env);
    if (opts.env.PKG_EXECPATH === 'PKG_INVOKE_NODEJS') return;
    opts.env.PKG_EXECPATH = EXECPATH;
  }

  function startsWith2(args, index, name, impostor) {
    const qsName = `"${name} `;
    if (args[index].slice(0, qsName.length) === qsName) {
      args[index] = `"${impostor} ${args[index].slice(qsName.length)}`;
      return true;
    }
    const sName = `${name} `;
    if (args[index].slice(0, sName.length) === sName) {
      args[index] = `${impostor} ${args[index].slice(sName.length)}`;
      return true;
    }
    if (args[index] === name) {
      args[index] = impostor;
      return true;
    }
    return false;
  }

  function startsWith(args, index, name) {
    const qName = `"${name}"`;
    const qEXECPATH = `"${EXECPATH}"`;
    const jsName = JSON.stringify(name);
    const jsEXECPATH = JSON.stringify(EXECPATH);
    return (
      startsWith2(args, index, name, EXECPATH) ||
      startsWith2(args, index, qName, qEXECPATH) ||
      startsWith2(args, index, jsName, jsEXECPATH)
    );
  }

  function modifyLong(args, index) {
    if (!args[index]) return;
    return (
      startsWith(args, index, 'node') ||
      startsWith(args, index, ARGV0) ||
      startsWith(args, index, ENTRYPOINT) ||
      startsWith(args, index, EXECPATH)
    );
  }

  function modifyShort(args) {
    if (!args[0]) return;
    if (!Array.isArray(args[1])) {
      args.splice(1, 0, []);
    }
    if (
      args[0] === 'node' ||
      args[0] === ARGV0 ||
      args[0] === ENTRYPOINT ||
      args[0] === EXECPATH
    ) {
      args[0] = EXECPATH;
    } else {
      for (let i = 1; i < args[1].length; i += 1) {
        const mbc = args[1][i - 1];
        if (mbc === '-c' || mbc === '/c') {
          modifyLong(args[1], i);
        }
      }
    }
  }

  childProcess.spawn = function spawn() {
    const args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.spawn.apply(childProcess, args);
  };

  childProcess.spawnSync = function spawnSync() {
    const args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.spawnSync.apply(childProcess, args);
  };

  childProcess.execFile = function execFile() {
    const args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.execFile.apply(childProcess, args);
  };

  childProcess.execFileSync = function execFileSync() {
    const args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.execFileSync.apply(childProcess, args);
  };

  childProcess.exec = function exec() {
    const args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyLong(args, 0);
    return ancestor.exec.apply(childProcess, args);
  };

  childProcess.execSync = function execSync() {
    const args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyLong(args, 0);
    return ancestor.execSync.apply(childProcess, args);
  };
})();

// /////////////////////////////////////////////////////////////////
// PROMISIFY ///////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  const { custom } = promisify;
  const { customPromisifyArgs } = require('internal/util');

  // /////////////////////////////////////////////////////////////
  // FS //////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////////

  Object.defineProperty(fs.exists, custom, {
    value(path_) {
      return new Promise((resolve) => {
        fs.exists(path_, (exists) => {
          resolve(exists);
        });
      });
    },
  });

  Object.defineProperty(fs.read, customPromisifyArgs, {
    value: ['bytesRead', 'buffer'],
  });

  Object.defineProperty(fs.write, customPromisifyArgs, {
    value: ['bytesWritten', 'buffer'],
  });

  // /////////////////////////////////////////////////////////////
  // CHILD_PROCESS ///////////////////////////////////////////////
  // /////////////////////////////////////////////////////////////

  const customPromiseExecFunction =
    (o) =>
    (...args) => {
      let resolve;
      let reject;
      const p = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      p.child = o.apply(
        undefined,
        args.concat((error, stdout, stderr) => {
          if (error !== null) {
            error.stdout = stdout;
            error.stderr = stderr;
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        })
      );

      return p;
    };

  Object.defineProperty(childProcess.exec, custom, {
    value: customPromiseExecFunction(childProcess.exec),
  });

  Object.defineProperty(childProcess.execFile, custom, {
    value: customPromiseExecFunction(childProcess.execFile),
  });
})();

// /////////////////////////////////////////////////////////////////
// PATCH PROCESS ///////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  const ancestor = {
    dlopen: process.dlopen,
  };

  function revertMakingLong(f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  process.dlopen = function dlopen() {
    const args = cloneArgs(arguments);
    const modulePath = revertMakingLong(args[1]);
    const moduleBaseName = path.basename(modulePath);
    const moduleFolder = path.dirname(modulePath);

    if (insideSnapshot(modulePath)) {
      const moduleContent = fs.readFileSync(modulePath);

      // Node addon files and .so cannot be read with fs directly, they are loaded with process.dlopen which needs a filesystem path
      // we need to write the file somewhere on disk first and then load it
      // the hash is needed to be sure we reload the module in case it changes
      const hash = createHash('sha256').update(moduleContent).digest('hex');

      // Example: /tmp/pkg/<hash>
      const tmpFolder = path.join(tmpdir(), 'pkg', hash);

      createDirRecursively(tmpFolder);

      // Example: moduleFolder = /snapshot/appname/node_modules/sharp/build/Release
      const parts = moduleFolder.split(path.sep);
      const mIndex = parts.indexOf('node_modules') + 1;

      let newPath;

      // it's a node addon file contained in node_modules folder
      // we copy the entire module folder in tmp folder
      if (mIndex > 0) {
        // Example: modulePackagePath = sharp/build/Release
        const modulePackagePath = parts.slice(mIndex).join(path.sep);
        // Example: modulePkgFolder = /snapshot/appname/node_modules/sharp
        const modulePkgFolder = parts.slice(0, mIndex + 1).join(path.sep);

        // here we copy all files from the snapshot module folder to temporary folder
        // we keep the module folder structure to prevent issues with modules that are statically
        // linked using relative paths (Fix #1075)
        copyFolderRecursiveSync(modulePkgFolder, tmpFolder);

        // Example: /tmp/pkg/<hash>/sharp/build/Release/sharp.node
        newPath = path.join(tmpFolder, modulePackagePath, moduleBaseName);
      } else {
        const tmpModulePath = path.join(tmpFolder, moduleBaseName);

        if (!fs.existsSync(tmpModulePath)) {
          fs.copyFileSync(modulePath, tmpModulePath);
        }

        // load the copied file in the temporary folder
        newPath = tmpModulePath;
      }

      // replace the path with the new module path
      args[1] = newPath;
    }

    return ancestor.dlopen.apply(process, args);
  };
})();
