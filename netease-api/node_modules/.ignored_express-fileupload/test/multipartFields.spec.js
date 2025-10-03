'use strict';

const request = require('supertest');
const server = require('./server');
const app = server.setup();

let mockUser = {
  firstName: 'Joe',
  lastName: 'Schmo',
  email: 'joe@mailinator.com'
};

let mockCars = [
  'rsx',
  'tsx',
  'civic',
  'integra'
];

describe('multipartFields: Test Multipart Form Single Field Submissions', function() {
  it('submit multipart user data with POST', function(done) {
    request(app)
      .post('/fields/user')
      .field('firstName', mockUser.firstName)
      .field('lastName', mockUser.lastName)
      .field('email', mockUser.email)
      .expect('Content-Type', /json/)
      .expect(200, {
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email
      }, done);
  });

  it('submit multipart user data with PUT', function(done) {
    request(app)
      .post('/fields/user')
      .field('firstName', mockUser.firstName)
      .field('lastName', mockUser.lastName)
      .field('email', mockUser.email)
      .expect('Content-Type', /json/)
      .expect(200, {
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email
      }, done);
  });

  it('fail when user data submitted without multipart', function(done) {
    request(app)
      .post('/fields/user')
      .send(mockUser)
      .expect(400)
      .end(done);
  });

  it('fail when user data not submitted', function(done) {
    request(app)
      .post('/fields/user')
      .expect(400)
      .end(done);
  });
});

describe('multipartFields: Test Multipart Form Array Field Submissions', function() {
  it('submit array of data with POST', function(done) {
    let req = request(app).post('/fields/array');

    for (let i = 0; i < mockCars.length; i++) {
      req.field('testField', mockCars[i]);
    }

    req
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        let responseMatchesRequest = res.body.join(',') === mockCars.join(',');

        done(responseMatchesRequest ? null : 'Data was returned as expected.');
      });
  });
});
