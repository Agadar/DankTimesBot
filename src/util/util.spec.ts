import 'mocha';
import assert = require('assert');
import * as util from './util';

describe('util.padNumber(msg)', () => {
  const tests = [
    { arg: "0", expected: "00" },
    { arg: "7", expected: "07" },
    { arg: "13", expected: "13" },
    { arg: "20", expected: "20" }
  ];

  tests.forEach(function (test) {
    it('Should create a valid string (' + test.arg + ')', function () {
      assert.deepEqual(test.expected, util.padNumber(test.arg));
    });
  });

  const stringTests = [
    { args: ["13", "37"], expected: "1337" },
    { args: ["0", "5"], expected: "0005" },
    { args: ["12", "3"], expected: "1203" },
    { args: ["3", "12"], expected: "0312" }
  ];

  stringTests.forEach(function (test) {
    it('Should create a valid string: (' + test.args[0] + " + " + test.args[1] + ') => ' + test.expected + ' ?', function () {
      assert.deepEqual(test.expected, util.padNumber(test.args[0]) + util.padNumber(test.args[1]));
    });
  });
});
