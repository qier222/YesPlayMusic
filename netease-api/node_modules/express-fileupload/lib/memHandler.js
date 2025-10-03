const crypto = require('crypto');
const { debugLog } = require('./utilities');

/**
 * memHandler - In memory upload handler
 * @param {Object} options
 * @param {String} fieldname
 * @param {String} filename
 * @returns {Object}
 */
module.exports = (options, fieldname, filename) => {
  const buffers = [];
  const hash = crypto.createHash(options.hashAlgorithm);
  let fileSize = 0;
  let completed = false;

  const getBuffer = () => Buffer.concat(buffers, fileSize);

  return {
    dataHandler: (data) => {
      if (completed === true) {
        debugLog(options, `Error: got ${fieldname}->${filename} data chunk for completed upload!`);
        return;
      }
      buffers.push(data);
      hash.update(data);
      fileSize += data.length;
      debugLog(options, `Uploading ${fieldname}->${filename}, bytes:${fileSize}...`);
    },
    getBuffer: getBuffer,
    getFilePath: () => '',
    getFileSize: () => fileSize,
    getHash: () => hash.digest('hex'),
    complete: () => {
      debugLog(options, `Upload ${fieldname}->${filename} completed, bytes:${fileSize}.`);
      completed = true;
      return getBuffer();
    },
    cleanup: () => { completed = true; },
    getWritePromise: () => Promise.resolve()
  };
};
