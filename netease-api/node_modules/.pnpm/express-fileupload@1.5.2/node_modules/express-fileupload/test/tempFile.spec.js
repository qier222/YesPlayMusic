const fs = require('fs');
const md5 = require('md5');
const path = require('path');
const request = require('supertest');
const server = require('./server');
const assert = require('assert');
const process = require('process');

const clearUploadsDir = server.clearUploadsDir;
const fileDir = server.fileDir;
const uploadDir = server.uploadDir;

const tempFileDir = '/tmp/';

/** Default permissions different for win32 and linux systems */
const defaultFilePermissions = process.platform === 'win32' ? 0o666 : 0o644;

describe('tempFile: Test fileupload w/ useTempFiles.', function() {
  afterEach(function(done) {
    clearUploadsDir();
    done();
  });
  /**
   * Upload the file for testing and verify the expected filename.
   * @param {object} options The expressFileUpload options.
   * @param {string} actualFileNameToUpload The name of the file to upload.
   * @param {string} expectedFileNameOnFileSystem The name of the file after upload.
   * @param {function} done The mocha continuation function.
   */
  function executeFileUploadTestWalk(
    options,
    actualFileNameToUpload,
    expectedFileNameOnFileSystem,
    done,
    expectedFilePermissions = defaultFilePermissions
  ) {

    let filePath = path.join(fileDir, actualFileNameToUpload);
    let fileBuffer = fs.readFileSync(filePath);
    let fileHash = md5(fileBuffer);
    let fileStat = fs.statSync(filePath);
    let uploadedFilePath = path.join(uploadDir, expectedFileNameOnFileSystem);

    request(
      server.setup(options)
    )
      .post('/upload/single')
      .attach('testFile', filePath)
      .expect((res)=>{
        res.body.uploadDir = '';
        res.body.uploadPath = '';
      })
      .expect(200, {
        name: expectedFileNameOnFileSystem,
        md5: fileHash,
        size: fileStat.size,
        uploadDir: '',
        uploadPath: ''
      })
      .end(function(err) {
        if (err) {
          return done(err);
        }
        fs.stat(uploadedFilePath, function(err, stats) {
          if (err) {
            return done(err);
          }
          assert.equal(stats.mode & 0o777, expectedFilePermissions);
          done();
        });
      });
  }
  describe('Testing [safeFileNames w/ useTempFiles] option to ensure:', function() {
    it('Does nothing to your filename when disabled.', function(done) {
      const fileUploadOptions = {
        safeFileNames: false,
        useTempFiles: true,
        tempFileDir
      };
      const actualFileName = 'my$Invalid#fileName.png123';
      const expectedFileName = 'my$Invalid#fileName.png123';
      executeFileUploadTestWalk(
        fileUploadOptions,
        actualFileName,
        expectedFileName,
        done
      );
    });
    it('Is disabled by default.', function(done) {
      const fileUploadOptions = {
        useTempFiles: true,
        tempFileDir
      };
      const actualFileName = 'my$Invalid#fileName.png123';
      const expectedFileName = 'my$Invalid#fileName.png123';
      executeFileUploadTestWalk(
        fileUploadOptions,
        actualFileName,
        expectedFileName,
        done
      );
    });

    it(
      'Strips away all non-alphanumeric characters (excluding hyphens/underscores) when enabled.',
      function(done) {
        const fileUploadOptions = {
          safeFileNames: true,
          useTempFiles: true,
          tempFileDir
        };
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng123';
        executeFileUploadTestWalk(
          fileUploadOptions,
          actualFileName,
          expectedFileName,
          done
        );
      });

    it(
      'Accepts a regex for stripping (decidedly) "invalid" characters from filename.',
      function(done) {
        const fileUploadOptions = {
          safeFileNames: /[$#]/g,
          useTempFiles: true,
          tempFileDir
        };
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileName.png123';
        executeFileUploadTestWalk(
          fileUploadOptions,
          actualFileName,
          expectedFileName,
          done
        );
      });
  });
  describe('Testing [tempFilePermissions w/ useTempFiles] option to ensure:', function() {
    it('Does nothing to your filename when disabled.', function(done) {
      const fileUploadOptions = {
        safeFileNames: false,
        useTempFiles: true,
        tempFileDir,
        tempFilePermissions: 0o666
      };
      const actualFileName = 'my$Invalid#fileName.png123';
      const expectedFileName = 'my$Invalid#fileName.png123';
      executeFileUploadTestWalk(
        fileUploadOptions,
        actualFileName,
        expectedFileName,
        done
      );
    });
    it('Respects option boundaries when provided.', function(done) {
      const fileUploadOptions = {
        useTempFiles: true,
        tempFileDir,
        tempFilePermissions: 0o7777
      };
      const expressFileupload = require('../lib/index');
      assert.throws(function() {
        expressFileupload(fileUploadOptions);
      }, Error, 'File permissions out of bounds');
      done();
    });
    it('Applies permissions in filesystem.', function(done) {
      const fileUploadOptions = {
        useTempFiles: true,
        tempFileDir,
        tempFilePermissions: 0o600
      };
      const actualFileName = 'my$Invalid#fileName.png123';
      const expectedFileName = 'my$Invalid#fileName.png123';
      // Expected file perms after moving it to the destination folder depends on the platform.
      const expectedFilePermissions = process.platform === 'win32' ? 0o666 : 0o600;

      executeFileUploadTestWalk(
        fileUploadOptions,
        actualFileName,
        expectedFileName,
        done,
        expectedFilePermissions
      );
    });
  });
});
