'use strict';

const assert = require('assert');
const UploadTimer = require('../lib/uploadtimer');

describe('uploadTimer: Test UploadTimer class', () => {

  it('It runs a callback function after specified timeout.', (done) => {
    const uploadTimer = new UploadTimer(500, done);
    uploadTimer.set();
  });

  it('set method returns true if timeout specified.', () => {
    const uploadTimer = new UploadTimer(500);
    assert.equal(uploadTimer.set(), true);
    uploadTimer.clear();
  });

  it('set method returns false if timeout has not specified.', () => {
    const uploadTimer = new UploadTimer();
    assert.equal(uploadTimer.set(), false);
  });

  it('set method returns false if zero timeout has specified.', () => {
    const uploadTimer = new UploadTimer(0);
    assert.equal(uploadTimer.set(), false);
  });

  it('set method returns false if timer allready set.', () => {
    const uploadTimer = new UploadTimer(500);
    uploadTimer.set();
    assert.equal(uploadTimer.set(), false);
    uploadTimer.clear();
  });

  it('refresh method returns false if timer has not been set/initialized.', () => {
    const uploadTimer = new UploadTimer(500);
    assert.equal(uploadTimer.refresh(), false);
  });

});
