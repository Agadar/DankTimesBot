import { assert } from "chai";
import "mocha";
import { Release } from "../misc/release";
import { Util } from "./util";

describe("util.padNumber(msg)", () => {

    const util = new Util();
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

describe("util.releaseLogToWhatsNewMessage", () => {

    let util: Util;

    beforeEach(() => {
        util = new Util();
    });

    it("Returns default error message on empty log", () => {
        const message = util.releaseLogToWhatsNewMessage([]);
        assert.equal(message, "⚠️ Release notes are unavailable!");
    });

    it("Returns neatly formatted string of first entry of non-empty log", () => {
        const releases = [
            new Release("10.10.10", "November 5th, 1933", ["A", "B", "C"]),
            new Release("9.9.9", "September 5th, 1921", ["1", "2", "3"]),
        ];
        const message = util.releaseLogToWhatsNewMessage(releases);
        assert.equal(message, "<b>🗒️ What's new in version 10.10.10 ?</b>\n\n- A\n- B\n- C\n");
    });

});

describe("util.parseScoreInput", () => {

    let util: Util;

    beforeEach(() => {
        util = new Util();
    });

    it("Parses positive numerical input", () => {
        const result = util.parseScoreInput("5");
        assert.equal(result, 5);
    });

    it("Parses negative numerical input", () => {
        const result = util.parseScoreInput("-5");
        assert.equal(result, -5);
    });

    it("Parses broken numerical input", () => {
        const result = util.parseScoreInput("5.5");
        assert.equal(result, 6);
    });

    it("Parses numerical input appended with a 'k'", () => {
        const result = util.parseScoreInput("5k");
        assert.equal(result, 5000);
    });

    it("Parses broken numerical input appended with a 'k'", () => {
        const result = util.parseScoreInput("5.5k");
        assert.equal(result, 5500);
    });

    it("Parses numerical input appended with a 'm'", () => {
        const result = util.parseScoreInput("5m");
        assert.equal(result, 5000000);
    });

    it("Parses numerical input appended with a 'K'", () => {
        const result = util.parseScoreInput("5K");
        assert.equal(result, 5000);
    });

    it("Parses numerical input appended with a 'M'", () => {
        const result = util.parseScoreInput("5M");
        assert.equal(result, 5000000);
    });

    it("Parses 'all' text", () => {
        const result = util.parseScoreInput("all", 100);
        assert.equal(result, 100);
    });

    it("Parses 'half' text", () => {
        const result = util.parseScoreInput("half", 100);
        assert.equal(result, 50);
    });

    it("Gives 'null' for numerical input appended with an invalid letter", () => {
        const result = util.parseScoreInput("5a");
        assert.isNull(result);
    });

    it("Gives 'null' for non-numerical input", () => {
        const result = util.parseScoreInput("abc");
        assert.isNull(result);
    });

    it("Gives 'null' for mixed numerical and non-numerical input", () => {
        const result = util.parseScoreInput("a1b2c");
        assert.isNull(result);
    });
});
