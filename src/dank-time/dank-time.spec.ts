import assert = require("assert");
import "mocha";
import { DankTime } from "./dank-time";

describe("DankTime.compare(a, b)", () => {
  const tests = [
    { args: [new DankTime(13, 37, ["1"], 5), new DankTime(13, 37, ["5"], 1)], expected: 0 },
    { args: [new DankTime(10, 0, ["2"], 4), new DankTime(9, 10, ["4"], 2)], expected: 1 },
    { args: [new DankTime(16, 0, ["3"], 3), new DankTime(17, 5, ["3"], 3)], expected: -1 },
    { args: [new DankTime(15, 30, ["4"], 2), new DankTime(15, 20, ["2"], 4)], expected: 1 },
    { args: [new DankTime(15, 15, ["5"], 1), new DankTime(15, 30, ["1"], 5)], expected: -1 },
  ];

  tests.forEach(function(test) {
    it("Should compare correctly.", function() {
      assert.equal(test.expected, DankTime.compare(test.args[0], test.args[1]));
    });
  });
});
