const ACCEPTABLE_CONTENT_TYPE = /^multipart\/[\w'"()+-_?/:=,.]+(?:; ?[\w'"()+-_?/:=,.]*)+$/i;
const UNACCEPTABLE_METHODS = new Set(['GET', 'HEAD', 'DELETE', 'OPTIONS', 'CONNECT', 'TRACE']);

/**
 * Ensures the request contains a content body
 * @param  {Object} req Express req object
 * @returns {Boolean}
 */
const hasBody = (req) => {
  return ('transfer-encoding' in req.headers) ||
    ('content-length' in req.headers && req.headers['content-length'] !== '0');
};

/**
 * Ensures the request is not using a non-compliant multipart method
 * such as GET or HEAD
 * @param  {Object} req Express req object
 * @returns {Boolean}
 */
const hasAcceptableMethod = (req) => !UNACCEPTABLE_METHODS.has(req.method);

/**
 * Ensures that only multipart requests are processed by express-fileupload
 * ACCEPTABLE_CONTENT_TYPE REgex is based on the RFC 2046
 * Validates special characters according to RFC 2046, section 5.1.1: '"()+_-=?/:
 * Also checks for the presence of boundary in the header.
 * @param  {Object}  req Express req object
 * @returns {Boolean}
 */
const hasAcceptableContentType = (req) => {
  const contType = req.headers['content-type'];
  return contType.includes('boundary=') && ACCEPTABLE_CONTENT_TYPE.test(contType);
};

/**
 * Ensures that the request in question is eligible for file uploads
 * @param {Object} req Express req object
 * @returns {Boolean}
 */
module.exports = (req) => {
  try {
    return hasBody(req) && hasAcceptableMethod(req) && hasAcceptableContentType(req);
  } catch (e) {
    return false;
  }
};
