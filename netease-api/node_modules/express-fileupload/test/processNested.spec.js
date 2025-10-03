'use strict';

const assert = require('assert');
const processNested = require('../lib/processNested');

describe('processNested: Test Convert Flatten object to Nested object', function() {
  it('With no nested data', () => {
    const data = {
        'firstname': 'John',
        'lastname': 'Doe',
        'age': 22
      },
      excerpt = { firstname: 'John', lastname: 'Doe', age: 22 },
      processed = processNested(data);

    assert.deepEqual(processed, excerpt);
  });

  it('With nested data', () => {
    const data = {
        'firstname': 'John',
        'lastname': 'Doe',
        'age': 22,
        'hobbies[0]': 'Cinema',
        'hobbies[1]': 'Bike',
        'address[line]': '78  Lynch Street',
        'address[city]': 'Milwaukee',
        'friends[0][name]': 'Jane',
        'friends[0][lastname]': 'Doe',
        'friends[1][name]': 'Joe',
        'friends[1][lastname]': 'Doe'
      },
      excerpt = {
        firstname: 'John',
        lastname: 'Doe',
        age: 22,
        hobbies: [ 'Cinema', 'Bike' ],
        address: { line: '78  Lynch Street', city: 'Milwaukee' },
        friends: [
          { name: 'Jane', lastname: 'Doe' },
          { name: 'Joe', lastname: 'Doe' }
        ]
      },
      processed = processNested(data);

    assert.deepEqual(processed, excerpt);
  });

  it('Do not allow prototype pollution', () => {
    const pollutionOb1 = JSON.parse(`{"__proto__.POLLUTED1": "FOOBAR"}`);
    const pollutionOb2 = JSON.parse(`{"constructor.prototype.POLLUTED2": "FOOBAR"}`);

    processNested(pollutionOb1);
    processNested(pollutionOb2);

    assert.equal(global.POLLUTED1, undefined);
    assert.equal(global.POLLUTED2, undefined);
  });
});
