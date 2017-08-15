import { assert } from "chai";
import "mocha";
import * as util from "./util";

describe("util.padNumber(msg)", () => {
  const tests = [
    { arg: "0", expected: "00" },
    { arg: "7", expected: "07" },
    { arg: "13", expected: "13" },
    { arg: "20", expected: "20" },
  ];

  tests.forEach((test) => {
    it("Should create a valid string (" + test.arg + ")", () => {
      assert.deepEqual(test.expected, util.padNumber(test.arg));
    });
  });

  const stringTests = [
    { args: ["13", "37"], expected: "1337" },
    { args: ["0", "5"], expected: "0005" },
    { args: ["12", "3"], expected: "1203" },
    { args: ["3", "12"], expected: "0312" },
  ];

  stringTests.forEach((test) => {
    it(`Should create a valid string: (${test.args[0]} + ${test.args[1]}) => ${test.expected} ?`, () => {
      assert.deepEqual(test.expected, util.padNumber(test.args[0]) + util.padNumber(test.args[1]));
    });
  });
});
