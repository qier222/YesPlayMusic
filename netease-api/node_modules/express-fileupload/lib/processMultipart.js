const Busboy = require('busboy');
const UploadTimer = require('./uploadtimer');
const fileFactory = require('./fileFactory');
const memHandler = require('./memHandler');
const tempFileHandler = require('./tempFileHandler');
const processNested = require('./processNested');
const {
  isFunc,
  debugLog,
  buildFields,
  buildOptions,
  parseFileName
} = require('./utilities');

const waitFlushProperty = Symbol('wait flush property symbol');

/**
 * Processes multipart request
 * Builds a req.body object for fields
 * Builds a req.files object for files
 * @param  {Object}   options expressFileupload and Busboy options
 * @param  {Object}   req     Express request object
 * @param  {Object}   res     Express response object
 * @param  {Function} next    Express next method
 * @return {void}
 */
module.exports = (options, req, res, next) => {
  req.files = null;

  // Build busboy options and init busboy instance.
  const busboyOptions = buildOptions(options, { headers: req.headers });
  const busboy = Busboy(busboyOptions);

  /**
   * Closes connection with specified reason and http code.
   * @param {number} code HTTP response code, default: 400.
   * @param {*} reason Reason to close connection, default: 'Bad Request'.
   */
  const closeConnection = (code, reason) => {
    req.unpipe(busboy);
    req.resume();
    if (res.headersSent) {
      debugLog(options, 'Headers already sent, can\'t close connection.');
      return;
    }
    const resCode = code || 400;
    const resReason = reason || 'Bad Request';
    debugLog(options, `Closing connection with ${resCode}: ${resReason}`);
    res.writeHead(resCode, { Connection: 'close' });
    res.end(resReason);
  };

  // Express proxies sometimes attach multipart data to a buffer
  if (req.body instanceof Buffer) {
    req.body = Object.create(null);
  }
  // Build multipart req.body fields
  busboy.on('field', (field, val) => req.body = buildFields(req.body, field, val));

  // Build req.files fields
  busboy.on('file', (field, file, info) => {
    // Parse file name(cutting huge names, decoding, etc..).
    const {filename:name, encoding, mimeType: mime} = info;
    const filename = parseFileName(options, name);
    // Define methods and handlers for upload process.
    const {
      dataHandler,
      getFilePath,
      getFileSize,
      getHash,
      complete,
      cleanup,
      getWritePromise
    } = options.useTempFiles
      ? tempFileHandler(options, field, filename) // Upload into temporary file.
      : memHandler(options, field, filename);     // Upload into RAM.

    const writePromise = options.useTempFiles
      ? getWritePromise().catch(err => {
        req.unpipe(busboy);
        req.resume();
        cleanup();
        next(err);
      }) : getWritePromise();

    // Define upload timer.
    const uploadTimer = new UploadTimer(options.uploadTimeout, () => {
      file.removeAllListeners('data');
      file.resume();
      // After destroy an error event will be emitted and file clean up will be done.
      // In some cases file.destroy() doesn't exist, so we need to check this, see issue:
      // https://github.com/richardgirges/express-fileupload/issues/259.
      const err = new Error(`Upload timeout for ${field}->${filename}, bytes:${getFileSize()}`);
      return isFunc(file.destroy) ? file.destroy(err) : file.emit('error', err);
    });

    file.on('limit', () => {
      debugLog(options, `Size limit reached for ${field}->${filename}, bytes:${getFileSize()}`);
      // Reset upload timer in case of file limit reached.
      uploadTimer.clear();
      // Run a user defined limit handler if it has been set.
      if (isFunc(options.limitHandler)) {
        options.limitHandler(req, res, next);
      }
      // Close connection with 413 code and do cleanup if abortOnLimit set(default: false).
      if (options.abortOnLimit) {
        debugLog(options, `Aborting upload because of size limit ${field}->${filename}.`);
        closeConnection(413, options.responseOnLimit);
        cleanup();
      }
    });

    file.on('data', (data) => {
      uploadTimer.refresh(); // Refresh upload timer each time new data chunk came.
      dataHandler(data); // Handle new piece of data.
    });

    file.on('end', () => {
      const size = getFileSize();
      // Debug logging for file upload ending.
      debugLog(options, `Upload finished ${field}->${filename}, bytes:${size}`);
      // Reset upload timer in case of end event.
      uploadTimer.clear();
      // See https://github.com/richardgirges/express-fileupload/issues/191
      // Do not add file instance to the req.files if original name and size are empty.
      // Empty name and zero size indicates empty file field in the posted form.
      if (!name && size === 0) {
        if (options.useTempFiles) {
          cleanup();
          debugLog(options, `Removing the empty file ${field}->${filename}`);
        }
        return debugLog(options, `Don't add file instance if original name and size are empty`);
      }
      req.files = buildFields(req.files, field, fileFactory({
        buffer: complete(),
        name: filename,
        tempFilePath: getFilePath(),
        hash: getHash(),
        size,
        encoding,
        truncated: file.truncated,
        mimetype: mime
      }, options));

      if (!req[waitFlushProperty]) {
        req[waitFlushProperty] = [];
      }
      req[waitFlushProperty].push(writePromise);
    });

    file.on('error', (err) => {
      uploadTimer.clear(); // Reset upload timer in case of errors.
      debugLog(options, err);
      cleanup();
      next();
    });

    // Debug logging for a new file upload.
    debugLog(options, `New upload started ${field}->${filename}, bytes:${getFileSize()}`);
    // Set new upload timeout for a new file.
    uploadTimer.set();
  });

  busboy.on('finish', () => {
    debugLog(options, `Busboy finished parsing request.`);
    if (options.parseNested) {
      req.body = processNested(req.body);
      req.files = processNested(req.files);
    }

    if (!req[waitFlushProperty]) return next();
    Promise.all(req[waitFlushProperty])
      .then(() => {
        delete req[waitFlushProperty];
        next();
      });
  });

  busboy.on('error', (err) => {
    debugLog(options, `Busboy error`);
    next(err);
  });

  req.pipe(busboy);
};
