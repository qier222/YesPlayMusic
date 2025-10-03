'use strict';

const fs = require('fs');
const md5 = require('md5');
const path = require('path');
const request = require('supertest');
const server = require('./server');

const fileDir = server.fileDir;
const tempDir = server.tempDir;
const uploadDir = server.uploadDir;
const clearTempDir = server.clearTempDir;
const clearUploadsDir = server.clearUploadsDir;

const mockFiles = ['car.png', 'tree.png', 'basketball.png', 'emptyfile.txt'];

const mockUser = {
  firstName: 'Joe',
  lastName: 'Schmo',
  email: 'joe@mailinator.com'
};

// Reset response body.uploadDir/uploadPath for testing.
const resetBodyUploadData = (res) => {
  res.body.uploadDir = '';
  res.body.uploadPath = '';
};

const genUploadResult = (fileName, filePath) => {
  const fileStat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  return {
    name: fileName,
    md5: md5(fileBuffer),
    size: fileStat.size,
    uploadDir: '',
    uploadPath: ''
  };
};

describe('multipartUploads: Test Directory Cleaning Method', function() {
  it('emptied "uploads" directory', function(done) {
    clearUploadsDir();
    const filesFound = fs.readdirSync(uploadDir).length;
    done(filesFound ? `Directory not empty. Found ${filesFound} files.` : null);
  });
});

describe('multipartUploads: Test Single File Upload', function() {
  const app = server.setup();

  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    const result = genUploadResult(fileName, filePath);

    it(`upload ${fileName} with POST`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });

    it(`upload ${fileName} with PUT`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });

  it('fail when no files were attached', function(done) {
    request(app)
      .post('/upload/single')
      .expect(400)
      .end(done);
  });

  it('fail when using GET', function(done) {
    request(app)
      .get('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });

  it('fail when using HEAD', function(done) {
    request(app)
      .head('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });
});

describe('multipartUploads: Test Single File Upload w/ .mv()', function() {
  const app = server.setup();

  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    const result = genUploadResult(fileName, filePath);

    it(`upload ${fileName} with POST w/ .mv()`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });

    it(`upload ${fileName} with PUT w/ .mv()`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });
});

describe('multipartUploads: Test Single File Upload w/ useTempFiles option.', function() {
  const app = server.setup({ useTempFiles: true, tempFileDir: tempDir });

  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    const result = genUploadResult(fileName, filePath);

    it(`upload ${fileName} with POST`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });

    it(`upload ${fileName} with PUT`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });

  it('fail when no files were attached', function(done) {
    request(app)
      .post('/upload/single')
      .expect(400)
      .end(done);
  });

  it('fail when using GET', function(done) {
    request(app)
      .get('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });

  it('fail when using HEAD', function(done) {
    request(app)
      .head('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });
});

describe('multipartUploads: Single File Upload w/ useTempFiles & empty tempFileDir.', function() {
  const app = server.setup({ useTempFiles: true, tempFileDir: '' });

  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    const result = genUploadResult(fileName, filePath);

    it(`upload ${fileName} with POST`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });
});

describe('multipartUploads: Test Single File Upload w/ .mv() Promise', function() {
  const app = server.setup();

  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    const result = genUploadResult(fileName, filePath);

    it(`upload ${fileName} with POST w/ .mv() Promise`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single/promise')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });

    it(`upload ${fileName} with PUT w/ .mv() Promise`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single/promise')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });

  it('fail when no files were attached', function(done) {
    request(app)
      .post('/upload/single')
      .expect(400)
      .end(done);
  });

  it('fail when using GET', function(done) {
    request(app)
      .get('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });

  it('fail when using HEAD', function(done) {
    request(app)
      .head('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });
});

describe('multipartUploads: Test Single File Upload w/ .mv() Promise & useTempFiles', function() {
  const app = server.setup({ useTempFiles: true, tempFileDir: tempDir });

  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    const result = genUploadResult(fileName, filePath);

    it(`upload ${fileName} with POST w/ .mv() Promise`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single/promise')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });

    it(`upload ${fileName} with PUT w/ .mv() Promise`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single/promise')
        .attach('testFile', filePath)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });

  it('fail when no files were attached', (done) => {
    request(app)
      .post('/upload/single')
      .expect(400)
      .end(done);
  });

  it('fail when using GET', (done) => {
    request(app)
      .get('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });

  it('fail when using HEAD', (done) => {
    request(app)
      .head('/upload/single')
      .attach('testFile', path.join(fileDir, mockFiles[0]))
      .expect(400)
      .end((err) => {
        // err.code === 'ECONNRESET' that means upload has been aborted.
        done(err && err.code !== 'ECONNRESET' ? err : null);
      });
  });
});

describe('multipartUploads: Test Multi-File Upload', function() {
  const app = server.setup();

  it('upload multiple files with POST', (done) => {
    clearUploadsDir();
    const req = request(app).post('/upload/multiple');
    const expectedResult = [];
    const expectedResultSorted = [];
    const uploadedFilesPath = [];
    mockFiles.forEach((fileName, index) => {
      const filePath = path.join(fileDir, fileName);
      req.attach(`testFile${index + 1}`, filePath);
      uploadedFilesPath.push(path.join(uploadDir, fileName));
      expectedResult.push(genUploadResult(fileName, filePath));
    });

    req
      .expect((res) => {
        res.body.forEach((fileInfo) => {
          fileInfo.uploadDir = '';
          fileInfo.uploadPath = '';
          const index = mockFiles.indexOf(fileInfo.name);
          expectedResultSorted.push(expectedResult[index]);
        });
      })
      .expect(200, expectedResultSorted)
      .end((err) => {
        if (err) return done(err);
        fs.stat(uploadedFilesPath[0], (err) => {
          if (err) return done(err);
          fs.stat(uploadedFilesPath[1], (err) => {
            if (err) return done(err);
            fs.stat(uploadedFilesPath[2], done);
          });
        });
      });
  });
});

describe('multipartUploads: Test File Array Upload', function() {
  const app = server.setup();

  it('upload array of files with POST', (done) => {
    clearUploadsDir();
    const req = request(app).post('/upload/array');
    const expectedResult = [];
    const expectedResultSorted = [];
    const uploadedFilesPath = [];
    mockFiles.forEach((fileName) => {
      const filePath = path.join(fileDir, fileName);
      uploadedFilesPath.push(path.join(uploadDir, fileName));
      expectedResult.push(genUploadResult(fileName, filePath));
      req.attach('testFiles', filePath);
    });

    req
      .expect((res)=>{
        res.body.forEach((fileInfo) => {
          fileInfo.uploadDir = '';
          fileInfo.uploadPath = '';
          const index = mockFiles.indexOf(fileInfo.name);
          expectedResultSorted.push(expectedResult[index]);
        });
      })
      .expect(200, expectedResultSorted)
      .end((err) => {
        if (err) return done(err);
        uploadedFilesPath.forEach((uploadedFilePath) => {
          fs.statSync(uploadedFilePath);
        });
        done();
      });
  });
});

describe('multipartUploads: Test Upload With Fields', function() {
  const app = server.setup();
  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);
    const uploadedFilePath = path.join(uploadDir, fileName);
    // Expected results
    const result = genUploadResult(fileName, filePath);
    result.firstName = mockUser.firstName;
    result.lastName = mockUser.lastName;
    result.email = mockUser.email;

    it(`upload ${fileName} and submit fields at the same time with POST`, function(done) {
      clearUploadsDir();
      request(app)
        .post('/upload/single/withfields')
        .attach('testFile', filePath)
        .field('firstName', mockUser.firstName)
        .field('lastName', mockUser.lastName)
        .field('email', mockUser.email)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });

    it(`upload ${fileName} and submit fields at the same time with PUT`, function(done) {
      clearUploadsDir();
      request(app)
        .put('/upload/single/withfields')
        .attach('testFile', filePath)
        .field('firstName', mockUser.firstName)
        .field('lastName', mockUser.lastName)
        .field('email', mockUser.email)
        .expect(resetBodyUploadData)
        .expect(200, result, err => (err ? done(err) : fs.stat(uploadedFilePath, done)));
    });
  });
});

describe('multipartUploads: Test Aborting/Canceling during upload', function() {
  this.timeout(4000); // Set timeout for async tests.
  const uploadTimeout = 1000;

  const app = server.setup({
    useTempFiles: true,
    tempFileDir: tempDir,
    debug: true,
    uploadTimeout
  });

  clearTempDir();
  clearUploadsDir();
  mockFiles.forEach((fileName) => {
    const filePath = path.join(fileDir, fileName);

    it(`Delete temp file if ${fileName} upload was aborted`, (done) => {
      const req = request(app)
        .post('/upload/single')
        .attach('testFile', filePath)
        .on('progress', (e) => {
          const progress = (e.loaded * 100) / e.total;
          // Aborting request, use req.req since it is original superagent request.
          if (progress > 50) req.req.abort();
        })
        .end((err) => {
          if (!err) return done(`Connection hasn't been aborted!`);
          if (err.code !== 'ECONNRESET') return done(err);
          // err.code === 'ECONNRESET' that means upload has been aborted.
          // Checking temp directory after upload timeout.
          setTimeout(() => {
            fs.readdir(tempDir, (err, files) => {
              if (err) return done(err);
              return files.length ? done(`Temporary directory contains files!`) : done();
            });
          }, uploadTimeout * 2);
        });
    });
  });
});
