import { assert } from "chai";
import "mocha";
import { User } from "./user";

describe("User.constructor", () => {

  it("supplying a negative score throws an error", () => {
    try {
      const user = new User(0, "user0", -5, 0, false, 0);
      assert.fail(0, 1, "Expected RangeError!");
    } catch (err) {
      if (!(err instanceof RangeError)) {
        throw err;
      }
    }
  });

  it("supplying correct values gives us a valid User object", () => {
    const user = new User(0, "user0", 5, 0, false, 0);
  });
});

describe("User.addToScore", () => {

  let user: User;

  beforeEach("reset test user object", () => {
    user = new User(0, "user0", 5, 0, false, 0);
  });

  it("supplying a non-whole score rounds it and adds it to the user's score", () => {
      user.alterScore(5.5, 100);
      assert.equal(user.score, 11);
      assert.equal(user.lastScoreChange, 6);
      assert.equal(user.lastScoreTimestamp, 100);
  });

  it("supplying a positive score adds it to user's score", () => {
    user.alterScore(5, 100);
    assert.equal(user.score, 10);
    assert.equal(user.lastScoreChange, 5);
    assert.equal(user.lastScoreTimestamp, 100);
  });

  it("supplying a negative score subtracts it from user's score", () => {
    user.alterScore(-2, 200);
    assert.equal(user.score, 3);
    assert.equal(user.lastScoreChange, -2);
    assert.equal(user.lastScoreTimestamp, 0);
  });

  it("supplying a negative score that would bring user's score below 0, sets user's score to 0", () => {
    user.alterScore(-10, 300);
    assert.equal(user.score, 0);
    assert.equal(user.lastScoreChange, -5);
    assert.equal(user.lastScoreTimestamp, 0);
  });
});
