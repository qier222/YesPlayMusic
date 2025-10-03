const { createTestFiles } = require('./server');

console.log('creating test files...');
createTestFiles()
  .then(() => console.log('done'));
