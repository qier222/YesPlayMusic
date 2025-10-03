"use strict";

const decode = require('..');
const assert = require('assert');
// Lol, I'm running so many tests that mocha broke.
const mocha = require('./mocha');
const describe = mocha.describe;
const it = mocha.it;

describe('Safe decodeURIComponent',() => {

  function validCodes(iterator) {
    for (let i = 0; i <= 0xFFFF; i += 16) {
      // This skips the invalid range
      if (i === 0xD800) {
        i = 0xE000;
      }
      const char = String.fromCharCode(i);
      iterator(char);
    }
  }
  function validSurrogates(iterator) {
    for (let i = 0x10000; i < 0x10FFFF; i += 16) {
      const char = String.fromCharCode(0xD7C0 + (i >> 10), 0xDC00 + (i & 0x3FF));
      iterator(char);
    }
  }
  function invalidCodes(iterator) {
    for (let i = 0x80; i <= 0xFF; i++) {
      iterator(`%${toHex(i)}`)
    }
    iterator('%C0%80');
    iterator('%E0%80%80');
    iterator('%E0%90%80');
    iterator('%ED%A0%80');
    iterator('%ED%B0%80');
    iterator('%F0%80%80%80');
    iterator('%F4%90%80%80');
    iterator('%F4%A0%80%80');
    iterator('%F4%B0%80%80');
  }
  function surrogateHalves(iterator) {
    for (let i = 0x10000; i < 0x10FFFF; i += 16) {
      iterator(`%${toHex(0xD7C0 + (i >> 10))}`);
      iterator(`%${toHex(0xDC00 + (i & 0x3FF))}`);
    }
  }

  function toHex(i) {
    const string = i.toString(16);
    switch (string.length) {
      case 0:
        return '00';
      case 1:
        return `0${string}`;
      default:
        return string;
    }
  }

  const test = (function() {
    function test(char, encodedChar, left, encodedLeft, right, encodedRight) {
      const combined = `${encodedLeft}${encodedChar}${encodedRight}`;
      const actual = decode(combined);
      const expected = `${left}${char}${right}`;
      assert.equal(decode(combined), expected);
    }

    return function(char, left, encodedChar, right) {
      test(char, encodedChar, left, encodeURIComponent(left), right, encodeURIComponent(right));
      if (left !== '%' || encodedChar[0] === '%') {
        test(char, encodedChar, left, left, right, right);
      }
    };
  })();

  function tests(char) {
    describe(`char: "${char.codePointAt(0)}"`, () => {
      it('decodes correctly encoded chars', () => {
        test(char, '', encodeURIComponent(char), '');
      });

      it('decodes correctly encoded strings', () => {
        const encoded = encodeURIComponent(char);

        for (let i = 0; i < 128; i += 3) {
          if (i === 48) {
            i += 12;
          } else if (i === 66 || i === 99) {
            i += 6;
          }
          const other = String.fromCharCode(i);
          test(char, '', encoded, '');
          test(char, other, encoded, '');
          test(char, '', encoded, other);
          test(char, other, encoded, other);
        }
      });

      it('handles incorrectly encoded chars', () => {
        const encoded = encodeURIComponent(char);
        for (let i = 1; i < encoded.length; i++) {
          const rightside = encoded.slice(0, i);
          test(rightside, '', rightside, '');
        }

        for (let i = 3; i < encoded.length; i += 3) {
          const leftside = encoded.slice(i);
          test(leftside, '', leftside, '');
        }
      });

      it('handles incorrectly encoded chars in a string', () => {
        const encoded = encodeURIComponent(char);
        for (let i = 1; i < encoded.length; i++) {
          const rightside = encoded.slice(0, i);

          for (let j = 0; j < 128; j += 3) {
            if (j === 48) {
              j += 12;
            } else if (j === 66 || j === 99) {
              j += 6;
            }
            const other = String.fromCharCode(j);
            test(rightside, '', rightside, '');
            test(rightside, other, rightside, '');
            test(rightside, '', rightside, other);
            test(rightside, other, rightside, other);
          }
        }

        for (let i = 3; i < encoded.length; i += 3) {
          const leftside = encoded.slice(i);

          for (let j = 0; j < 128; j += 3) {
            if (j === 48) {
              j += 12;
            } else if (j === 66 || j === 99) {
              j += 6;
            }
            const other = String.fromCharCode(j);
            test(leftside, '', leftside, '');
            test(leftside, other, leftside, '');
            test(leftside, '', leftside, other);
            test(leftside, other, leftside, other);
          }
        }
      });

      it('does not loose correctly encoded chars next to incorrectly encoded chars', () => {
        const encoded = encodeURIComponent(char);

        for (let i = 1; i < encoded.length; i++) {
          const rightside = encoded.slice(0, i);
          test(rightside, ' ', rightside, '');
          test(rightside, '', rightside, ' ');
          test(rightside, ' ', rightside, ' ');
          test(rightside, '¢', rightside, '');
          test(rightside, '', rightside, '¢');
          test(rightside, '¢', rightside, '¢');
          test(rightside, '™', rightside, '');
          test(rightside, '', rightside, '™');
          test(rightside, '™', rightside, '™');
          test(rightside, '💩', rightside, '');
          test(rightside, '', rightside, '💩');
          test(rightside, '💩', rightside, '💩');
        }

        for (let i = 3; i < encoded.length; i += 3) {
          const leftside = encoded.slice(i);
          test(leftside, ' ', leftside, '');
          test(leftside, '', leftside, ' ');
          test(leftside, ' ', leftside, ' ');
          test(leftside, '¢', leftside, '');
          test(leftside, '', leftside, '¢');
          test(leftside, '¢', leftside, '¢');
          test(leftside, '™', leftside, '');
          test(leftside, '', leftside, '™');
          test(leftside, '™', leftside, '™');
          test(leftside, '💩', leftside, '');
          test(leftside, '', leftside, '💩');
          test(leftside, '💩', leftside, '💩');
        }
      });
    });
  }

  describe('js module', () => {
    it('leaves non-encoded strings alone', () => {
      assert.equal(decode('test'), 'test');
    });

    describe('single chars', () => {
      validCodes(tests);
    });

    describe('surrogate chars', () => {
      validSurrogates(tests);
    });

    describe('rejects bad encodings', () => {
      function reject(char) {
        describe(`char: "${char}"`, () => {
          it('rejects', () => {
            assert.equal(decode(char), char);
          });
        });
      };

      surrogateHalves(reject);
      invalidCodes(reject);
    });
  });
});
