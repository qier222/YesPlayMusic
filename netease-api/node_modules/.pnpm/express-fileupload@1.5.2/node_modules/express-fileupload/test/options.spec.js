const fs = require('fs');
const path = require('path');
const request = require('supertest');
const server = require('./server');
const clearUploadsDir = server.clearUploadsDir;
const fileDir = server.fileDir;
const uploadDir = server.uploadDir;

describe('options: File Upload Options Tests', function() {
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
  function executeFileUploadTestWalk(options,
    actualFileNameToUpload,
    expectedFileNameOnFileSystem,
    done) {
    request(server.setup(options))
      .post('/upload/single')
      .attach('testFile', path.join(fileDir, actualFileNameToUpload))
      .expect(200)
      .end(function(err) {
        if (err) {
          return done(err);
        }

        const uploadedFilePath = path.join(uploadDir, expectedFileNameOnFileSystem);

        fs.stat(uploadedFilePath, done);
      });
  }

  describe('Testing [safeFileNames] option to ensure:', function() {
    it('Does nothing to your filename when disabled.',
      function(done) {
        const fileUploadOptions = {safeFileNames: false};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'my$Invalid#fileName.png123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Is disabled by default.',
      function(done) {
        const fileUploadOptions = null;
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'my$Invalid#fileName.png123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Strips away all non-alphanumeric characters (excluding hyphens/underscores) when enabled.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Accepts a regex for stripping (decidedly) "invalid" characters from filename.',
      function(done) {
        const fileUploadOptions = {safeFileNames: /[$#]/g};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileName.png123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });
  });

  describe('Testing [preserveExtension] option to ensure:', function() {
    it('Does not preserve the extension of your filename when disabled.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: false};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Is disabled by default.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Shortens your extension to the default(3) when enabled, if the extension found is larger.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: true};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng.123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Leaves your extension alone when enabled, if the extension found is <= default(3) length',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: true};
        const actualFileName = 'car.png';
        const expectedFileName = 'car.png';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Can be configured for an extension length > default(3).',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: 7};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileName.png123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Can be configured for an extension length < default(3).',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: 2};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng1.23';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Will use the absolute value of your extension length when negative.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: -5};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamep.ng123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Will leave no extension when the extension length == 0.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: 0};
        const actualFileName = 'car.png';
        const expectedFileName = 'car';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Will accept numbers as strings, if they can be resolved with parseInt.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: '3'};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng.123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Will be evaluated for truthy-ness if it cannot be parsed as an int.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: 'not-a-#-but-truthy'};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepng.123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Will ignore any decimal amount when evaluating for extension length.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: 4.98};
        const actualFileName = 'my$Invalid#fileName.png123';
        const expectedFileName = 'myInvalidfileNamepn.g123';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });

    it('Only considers the last dotted part as the extension.',
      function(done) {
        const fileUploadOptions = {safeFileNames: true, preserveExtension: true};
        const actualFileName = 'basket.ball.bp';
        const expectedFileName = 'basketball.bp';

        executeFileUploadTestWalk(fileUploadOptions, actualFileName, expectedFileName, done);
      });
  });

  describe('Testing [parseNested] option to ensure:', function() {
    it('When [parseNested] is enabled result are nested', function(done){
      const app = server.setup({parseNested: true});
      request(app)
        .post('/fields/nested')
        .field('name', 'John')
        .field('hobbies[0]', 'Cinema')
        .field('hobbies[1]', 'Bike')
        .expect('Content-Type', /json/)
        .expect(200, {
          name: 'John',
          hobbies: ['Cinema', 'Bike']
        }, done);
    });

    it('When [parseNested] is disabled are flattened', function(done){
      const app = server.setup({parseNested: false});
      request(app)
        .post('/fields/flattened')
        .field('name', 'John')
        .field('hobbies[0]', 'Cinema')
        .field('hobbies[1]', 'Bike')
        .expect('Content-Type', /json/)
        .expect(200, {
          name: 'John',
          'hobbies[0]': 'Cinema',
          'hobbies[1]': 'Bike'
        }, done);
    });
  });
});
