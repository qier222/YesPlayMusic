'use strict';

const path = require('path');
const processMultipart = require('./processMultipart');
const isEligibleRequest = require('./isEligibleRequest');
const { buildOptions, debugLog } = require('./utilities');
const busboy = require('busboy'); // eslint-disable-line no-unused-vars

const DEFAULT_OPTIONS = {
  debug: false,
  logger: console,
  uploadTimeout: 60000,
  fileHandler: false,
  uriDecodeFileNames: false,
  safeFileNames: false,
  preserveExtension: false,
  abortOnLimit: false,
  responseOnLimit: 'File size limit has been reached',
  limitHandler: false,
  createParentPath: false,
  parseNested: false,
  useTempFiles: false,
  tempFileDir: path.join(process.cwd(), 'tmp'),
  tempFilePermissions: 0o644,
  hashAlgorithm: 'md5'
};

/**
 * Expose the file upload middleware
 * @param {DEFAULT_OPTIONS & busboy.BusboyConfig} options - Middleware options.
 * @returns {Function} - express-fileupload middleware.
 */
module.exports = (options) => {
  const uploadOptions = buildOptions(DEFAULT_OPTIONS, options);
  return (req, res, next) => {
    if (!isEligibleRequest(req)) {
      debugLog(uploadOptions, 'Request is not eligible for file upload!');
      return next();
    }
    processMultipart(uploadOptions, req, res, next);
  };
};
