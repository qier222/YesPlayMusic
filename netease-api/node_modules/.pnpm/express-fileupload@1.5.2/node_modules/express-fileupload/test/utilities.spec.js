'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const md5 = require('md5');
const server = require('./server');
const fileDir = server.fileDir;
const uploadDir = server.uploadDir;
const {
  debugLog,
  isFunc,
  errorFunc,
  getTempFilename,
  buildOptions,
  buildFields,
  checkAndMakeDir,
  deleteFile,
  copyFile,
  moveFile,
  saveBufferToFile,
  parseFileName,
  uriDecodeFileName,
  isSafeFromPollution
} = require('../lib/utilities');

const mockFile = 'basketball.png';
const mockBuffer = fs.readFileSync(path.join(fileDir, mockFile));
const mockHash = md5(mockBuffer);

const mockFileMove = 'car.png';
const mockBufferMove = fs.readFileSync(path.join(fileDir, mockFileMove));
const mockHashMove = md5(mockBufferMove);

describe('utilities: Test of the utilities functions', function() {
  //debugLog tests
  describe('Test debugLog function', () => {

    let testMessage = 'Test message';

    it('debugLog returns false if no options passed', () => {
      assert.equal(debugLog(null, testMessage), false);
    });

    it('debugLog returns false if option debug is false or logger is not set', () => {
      assert.equal(debugLog({debug: false}, testMessage), false);
      assert.equal(debugLog({debug: true, logger: undefined}, testMessage), false);
      assert.equal(debugLog({debug: true, logger: {}}, testMessage), false);
    });

    it('debugLog returns true if option debug is true and logger is set', () => {
      assert.equal(debugLog({debug: true, logger: console}, testMessage), true);
    });

    it('supports a custom logger', () => {
      const calls = [];
      const logger = {
        log: (...args) => calls.push(args)
      };
      debugLog({debug: true, logger}, testMessage);
      assert.equal(calls.length, 1);
      assert.deepEqual(calls[0], [`Express-file-upload: ${testMessage}`]);
    });

  });
  //isFunc tests
  describe('Test isFunc function', () => {

    it('isFunc returns true if function passed', () => assert.equal(isFunc(()=>{}), true));

    it('isFunc returns false if null passed', function() {
      assert.equal(isFunc(null), false);
    });

    it('isFunc returns false if undefined passed', function() {
      assert.equal(isFunc(undefined), false);
    });

    it('isFunc returns false if object passed', function() {
      assert.equal(isFunc({}), false);
    });

    it('isFunc returns false if array passed', function() {
      assert.equal(isFunc([]), false);
    });
  });
  //errorFunc tests
  describe('Test errorFunc function', () => {

    const resolve = () => 'success';
    const reject = () => 'error';

    it('errorFunc returns resolve if reject function has not been passed', () => {
      let result = errorFunc(resolve);
      assert.equal(result(), 'success');
    });

    it('errorFunc returns reject if reject function has been passed', () => {
      let result = errorFunc(resolve, reject);
      assert.equal(result(), 'error');
    });

  });
  //getTempFilename tests
  describe('Test getTempFilename function', () => {

    const nameRegexp = /tmp-\d{1,5}-\d{1,}/;

    it('getTempFilename result matches regexp /tmp-d{1,5}-d{1,}/', () => {

      let errCounter = 0;
      let tempName = '';
      for (var i = 0; i < 65537; i++) {
        tempName = getTempFilename();
        if (!nameRegexp.test(tempName)) errCounter ++;
      }

      assert.equal(errCounter, 0);
    });

    it('getTempFilename current and previous results are not equal', () => {

      let errCounter = 0;
      let tempName = '';
      let previousName = '';
      for (var i = 0; i < 65537; i++) {
        previousName = tempName;
        tempName = getTempFilename();
        if (previousName === tempName) errCounter ++;
      }

      assert.equal(errCounter, 0);
    });

  });
  //parseFileName
  describe('Test parseFileName function', () => {

    it('Does nothing to your filename when disabled.', () => {
      const opts = {safeFileNames: false};
      const name = 'my$Invalid#fileName.png123';
      const expected = 'my$Invalid#fileName.png123';
      let result = parseFileName(opts, name);
      assert.equal(result, expected);
    });

    it('Cuts of file name length if it more then 255 chars.', () => {
      const name = 'a'.repeat(300);
      const result = parseFileName({}, name);
      assert.equal(result.length, 255);
    });

    it(
      'Strips away all non-alphanumeric characters (excluding hyphens/underscores) when enabled.',
      () => {
        const opts = {safeFileNames: true};
        const name = 'my$Invalid#fileName.png123';
        const expected = 'myInvalidfileNamepng123';
        let result = parseFileName(opts, name);
        assert.equal(result, expected);
      });

    it(
      'Strips away all non-alphanumeric chars when preserveExtension: true for a name without dots',
      () => {
        const opts = {safeFileNames: true, preserveExtension: true};
        const name = 'my$Invalid#fileName';
        const expected = 'myInvalidfileName';
        let result = parseFileName(opts, name);
        assert.equal(result, expected);
      });

    it('Accepts a regex for stripping (decidedly) "invalid" characters from filename.', () => {
      const opts = {safeFileNames: /[$#]/g};
      const name = 'my$Invalid#fileName.png123';
      const expected = 'myInvalidfileName.png123';
      let result = parseFileName(opts, name);
      assert.equal(result, expected);
    });

    it(
      'Returns correct filename if name contains dots characters and preserveExtension: true.',
      () => {
        const opts = {safeFileNames: true, preserveExtension: true};
        const name = 'basket.ball.png';
        const expected = 'basketball.png';
        let result = parseFileName(opts, name);
        assert.equal(result, expected);
      });

    it('Returns a temporary file name if name argument is empty.', () => {
      const opts = {safeFileNames: false};
      const result = parseFileName(opts);
      assert.equal(typeof result, 'string');
    });

  });
  //buildOptions tests
  describe('Test buildOptions function', () => {

    const source = { option1: '1', option2: '2', hashAlgorithm: 'md5' };
    const sourceAddon = { option3: '3', hashAlgorithm: 'sha256'};
    const expected = { option1: '1', option2: '2', hashAlgorithm: 'md5' };
    const expectedAddon = { option1: '1', option2: '2', option3: '3', hashAlgorithm: 'sha256'};

    it('buildOptions returns an equal object to the object which was passed', () => {
      let result = buildOptions(source);
      assert.deepStrictEqual(result, source);
    });

    it('buildOptions doesnt add non object or null arguments to the result', () => {
      let result = buildOptions(source, 2, '3', null);
      assert.deepStrictEqual(result, expected);
    });

    it('buildOptions adds value to the result from the several source arguments', () => {
      let result = buildOptions(source, sourceAddon);
      assert.deepStrictEqual(result, expectedAddon);
    });

    it('buildOptions throws an error when not provided a supported hashAlgorithm', () => {
      assert.throws(() => buildOptions({}));
    });

    it('buildOptions throws an error when given an unsupported hashAlgorithm', () => {
      assert.throws(() => buildOptions({ hashAlgorithm: 'not-actual-algo' }));
    });
  });
  //buildFields tests
  describe('Test buildFields function', () => {

    it('buildFields does nothing if null value has been passed', () => {
      let fields = null;
      fields = buildFields(fields, 'test', null);
      assert.equal(fields, null);
    });

  });
  //checkAndMakeDir tests
  describe('Test checkAndMakeDir function', () => {
    //
    it('checkAndMakeDir returns false if upload options object was not set', () => {
      assert.equal(checkAndMakeDir(), false);
    });
    //
    it('checkAndMakeDir returns false if upload option createParentPath was not set', () => {
      assert.equal(checkAndMakeDir({}), false);
    });
    //
    it('checkAndMakeDir returns false if filePath was not set', () => {
      assert.equal(checkAndMakeDir({createParentPath: true}), false);
    });
    //
    it('checkAndMakeDir return true if path to the file already exists', ()=>{
      let dir = path.join(uploadDir, 'testfile');
      assert.equal(checkAndMakeDir({createParentPath: true}, dir), true);
    });
    //
    it('checkAndMakeDir creates a dir if path to the file not exists', ()=>{
      let dir = path.join(uploadDir, 'testfolder', 'testfile');
      assert.equal(checkAndMakeDir({createParentPath: true}, dir), true);
    });
    //
    it('checkAndMakeDir creates a dir recursively if path to the file not exists', ()=>{
      let dir = path.join(uploadDir, 'testfolder', 'testsubfolder', 'testfile');
      assert.equal(checkAndMakeDir({createParentPath: true}, dir), true);
    });
  });

  describe('Test moveFile function', function() {
    beforeEach(() => server.clearUploadsDir());

    it('Should rename a file and check a hash', function(done) {
      const srcPath = path.join(fileDir, mockFileMove);
      const dstPath = path.join(uploadDir, mockFileMove);

      moveFile(srcPath, dstPath, function(err, renamed) {
        if (err) {
          return done(err);
        }
        fs.stat(dstPath, (err) => {
          if (err) {
            return done(err);
          }
          // Match source and destination files hash.
          const fileBuffer = fs.readFileSync(dstPath);
          const fileHash = md5(fileBuffer);
          if (fileHash !== mockHashMove) {
            return done(new Error('Hashes do not match'));
          }
          // Check that source file was deleted.
          fs.stat(srcPath, (err) => {
            if (err) {
              return done(renamed ? null : new Error('Source file was not renamed'));
            }
            done(new Error('Source file was not deleted'));
          });
        });
      });
    });
  });

  //saveBufferToFile tests
  describe('Test saveBufferToFile function', function(){
    beforeEach(() => server.clearUploadsDir());

    it('Save buffer to a file', function(done) {
      let filePath = path.join(uploadDir, mockFile);
      saveBufferToFile(mockBuffer, filePath, function(err){
        if (err) {
          return done(err);
        }
        fs.stat(filePath, done);
      });
    });

    it('Failed if not a buffer passed', function(done) {
      let filePath = path.join(uploadDir, mockFile);
      saveBufferToFile(undefined, filePath, function(err){
        if (err) {
          return done();
        }
      });
    });

    it('Failed if wrong path passed', function(done) {
      let filePath = '';
      saveBufferToFile(mockFile, filePath, function(err){
        if (err) {
          return done();
        }
      });
    });
  });

  describe('Test deleteFile function', function(){
    beforeEach(() => server.clearUploadsDir());

    it('Failed if nonexistent file passed', function(done){
      let filePath = path.join(uploadDir, getTempFilename());

      deleteFile(filePath, function(err){
        if (err) {
          return done();
        }
      });
    });

    it('Delete a file', function(done){
      let srcPath = path.join(fileDir, mockFile);
      let dstPath = path.join(uploadDir, getTempFilename());
      // copy a file
      copyFile(srcPath, dstPath, function(err){
        if (err) {
          return done(err);
        }
        fs.stat(dstPath, (err)=>{
          if (err) {
            return done(err);
          }
          // delete a file
          deleteFile(dstPath, function(err){
            if (err) {
              return done(err);
            }
            fs.stat(dstPath, (err)=> {
              return err ? done() : done(new Error('File was not deleted'));
            });
          });
        });
      });
    });

  });

  describe('Test copyFile function', function() {
    beforeEach(() => server.clearUploadsDir());

    it('Copy a file and check a hash', function(done) {
      let srcPath = path.join(fileDir, mockFile);
      let dstPath = path.join(uploadDir, mockFile);

      copyFile(srcPath, dstPath, function(err){
        if (err) {
          return done(err);
        }
        fs.stat(dstPath, (err)=>{
          if (err){
            return done(err);
          }
          // Match source and destination files hash.
          let fileBuffer = fs.readFileSync(dstPath);
          let fileHash = md5(fileBuffer);
          return fileHash === mockHash ? done() : done(new Error('Hashes do not match'));
        });
      });
    });

    it('Failed if wrong source file path passed', function(done){
      let srcPath = path.join(fileDir, 'unknown');
      let dstPath = path.join(uploadDir, mockFile);

      copyFile(srcPath, dstPath, function(err){
        if (err) {
          return done();
        }
      });
    });

    it('Failed if wrong destination file path passed', function(done){
      let srcPath = path.join(fileDir, 'unknown');
      let dstPath = path.join('unknown', 'unknown');

      copyFile(srcPath, dstPath, function(err){
        if (err) {
          return done();
        }
      });
    });
  });

  describe('Test uriDecodeFileName function', function() {
    const testData = [
      { enc: 'test%22filename', dec: 'test"filename' },
      { enc: 'test%60filename', dec: 'test`filename' },
      { enc: '%3Fx%3Dtest%22filename', dec: '?x=test"filename'},
      { enc: 'bug_bounty_upload_%91%91and%92.txt', dec: 'bug_bounty_upload_and.txt'}
    ];

    // Test decoding if uriDecodeFileNames: true.
    testData.forEach((testName) => {
      const opts = { uriDecodeFileNames: true };
      it(`Return ${testName.dec} for input ${testName.enc} if uriDecodeFileNames: true`, () => {
        assert.equal(uriDecodeFileName(opts, testName.enc), testName.dec);
      });
    });

    // Test decoding if uriDecodeFileNames: false.
    testData.forEach((testName) => {
      const opts = { uriDecodeFileNames: false };
      it(`Return ${testName.enc} for input ${testName.enc} if uriDecodeFileNames: false`, () => {
        assert.equal(uriDecodeFileName(opts, testName.enc), testName.enc);
      });
    });
  });

  describe('Test for no prototype pollution in buildFields', function() {
    const prototypeFields = [
      { name: '__proto__', data: {} },
      { name: 'constructor', data: {} },
      { name: 'toString', data: {} }
    ];

    const nonPrototypeFields = [
      { name: 'a', data: {} },
      { name: 'b', data: {} }
    ];

    let fieldObject = undefined;
    [...prototypeFields, ...nonPrototypeFields].forEach((field) => {
      fieldObject = buildFields(fieldObject, field.name, field.data);
    });

    it(`Has ${nonPrototypeFields.length} keys`, () => {
      assert.equal(Object.keys(fieldObject).length, nonPrototypeFields.length);
    });

    it(`Has null as its prototype`, () => {
      assert.equal(Object.getPrototypeOf(fieldObject), null);
    });

    prototypeFields.forEach((field) => {
      it(`${field.name} property is not an array`, () => {
        // Note, Array.isArray is an insufficient test due to it returning false
        // for Objects with an array prototype.
        assert.equal(fieldObject[field.name] instanceof Array, false);
      });
    });
  });

  describe('Test for correct detection of prototype pollution', function() {
    const validInsertions = [
      { base: {}, key: 'a' },
      { base: { a: 1 }, key: 'a' },
      { base: { __proto__: { a: 1 } }, key: 'a' },
      { base: [1], key: 0 },
      { base: { __proto__: [1] }, key: 0 }
    ];

    const invalidInsertions = [
      { base: {}, key: '__proto__' },
      { base: {}, key: 'constructor' },
      { base: [1], key: '__proto__' },
      { base: [1], key: 'length' },
      { base: { __proto__: [1] }, key: 'length' }
    ];

    validInsertions.forEach((insertion) => {
      it(`Key ${insertion.key} should be valid for ${JSON.stringify(insertion.base)}`, () => {
        assert.equal(isSafeFromPollution(insertion.base, insertion.key), true);
      });
    });

    invalidInsertions.forEach((insertion) => {
      it(`Key ${insertion.key} should not be valid for ${JSON.stringify(insertion.base)}`, () => {
        assert.equal(isSafeFromPollution(insertion.base, insertion.key), false);
      });
    });
  });
});
