'use strict';

const fs = require('fs');
const md5 = require('md5');
const path = require('path');
const assert = require('assert');
const server = require('./server');
const {isFunc} = require('../lib/utilities');
const fileFactory = require('../lib/fileFactory');

const mockFileName = 'basketball.png';
const mockFile = path.join(server.fileDir, mockFileName);
const mockBuffer = fs.readFileSync(mockFile);
const mockMd5 = md5(mockBuffer);

const mockFileOpts = {
  name: mockFileName,
  buffer: mockBuffer,
  encoding: 'utf-8',
  mimetype: 'image/png',
  hash: mockMd5,
  tempFilePath: mockFile
};

describe('fileFactory: Test of the fileFactory factory', function() {
  beforeEach(() => server.clearUploadsDir());

  it('return a file object', () => assert.ok(fileFactory(mockFileOpts)));

  describe('Properties', function() {
    it('contains the name property', () => {
      assert.equal(fileFactory(mockFileOpts).name, mockFileName);
    });
    it('contains the data property', () => assert.ok(fileFactory(mockFileOpts).data));
    it('contains the encoding property', () => {
      assert.equal(fileFactory(mockFileOpts).encoding, 'utf-8');
    });
    it('contains the mimetype property', () => {
      assert.equal(fileFactory(mockFileOpts).mimetype, 'image/png');
    });
    it('contains the md5 property', () => assert.equal(fileFactory(mockFileOpts).md5, mockMd5));
    it('contains the mv method', () => assert.equal(isFunc(fileFactory(mockFileOpts).mv), true));
  });

  describe('File object behavior for in memory upload', function() {
    const file = fileFactory(mockFileOpts);
    it('move the file to the specified folder', (done) => {
      file.mv(path.join(server.uploadDir, mockFileName), (err) => {
        assert.ifError(err);
        done();
      });
    });
    it('reject the mv if the destination does not exists', (done) => {
      file.mv(path.join(server.uploadDir, 'unknown', mockFileName), (err) => {
        assert.ok(err);
        done();
      });
    });
  });

  describe('File object behavior for upload into temporary file', function() {
    const file = fileFactory(mockFileOpts, { useTempFiles: true });
    it('move the file to the specified folder', (done) => {
      file.mv(path.join(server.uploadDir, mockFileName), (err) => {
        assert.ifError(err);
        // Place back moved file.
        fs.renameSync(path.join(server.uploadDir, mockFileName), mockFile);
        done();
      });
    });
    it('reject the mv if the destination does not exists', (done) => {
      file.mv(path.join(server.uploadDir, 'unknown', mockFileName), (err) => {
        assert.ok(err);
        done();
      });
    });
  });
});
