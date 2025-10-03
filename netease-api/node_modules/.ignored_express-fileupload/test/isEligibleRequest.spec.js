'use strict';

const assert = require('assert');
const isEligibleRequest = require('../lib/isEligibleRequest');

describe('isEligibleRequest function tests', () => {
  it('should return true if the request method is POST & headers set', () => {
    const req = {
      method: 'POST',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, true);
  });
  it('should return true if the request method is PUT & headers set', () => {
    const req = {
      method: 'PUT',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, true);
  });
  it('should return true if the request method is PATCH & headers set', () => {
    const req = {
      method: 'PATCH',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, true);
  });
  it('should return false if the request method is POST & content length 0', () => {
    const req = {
      method: 'POST',
      headers: {
        'content-length': '0',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request method is POST & no content-length', () => {
    const req = {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request method is POST & no boundary', () => {
    const req = {
      method: 'POST',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; ----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request method is not POST, PUT or PATCH', () => {
    const req = {
      method: 'GET',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request method is not POST, PUT or PATCH', () => {
    const req = {
      method: 'DELETE',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request method is not POST, PUT or PATCH', () => {
    const req = {
      method: 'OPTIONS',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request method is not POST, PUT or PATCH', () => {
    const req = {
      method: 'HEAD',
      headers: {
        'content-length': '768751',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryz2D47BnVMA7w5N36'
      }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
  it('should return false if the request is empty or not provided', () => {
    const result = isEligibleRequest();
    assert.equal(result, false);
  });
  it('should return false if content-type is not specified.', () => {
    const req = {
      method: 'POST',
      headers: { 'content-length': '768751' }
    };
    const result = isEligibleRequest(req);
    assert.equal(result, false);
  });
});
