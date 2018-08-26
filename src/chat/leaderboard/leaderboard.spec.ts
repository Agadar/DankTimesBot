import { assert } from "chai";
import "mocha";
import { Leaderboard } from "../leaderboard/leaderboard";
import { User } from "../user/user";

describe("Leaderboard.constructor", () => {

  it.only("should have created an ordered leaderboard", () => {
    const users = [
      new User(0, "user0", 15),
      new User(1, "user1", 5),
      new User(2, "user2", 20),
      new User(3, "user3", 10),
      new User(4, "user4", 20),
    ];
    const leaderboard = new Leaderboard(users);
    assert.equal(leaderboard.entries[0].id, users[2].id);
    assert.equal(leaderboard.entries[1].id, users[4].id);
    assert.equal(leaderboard.entries[2].id, users[0].id);
    assert.equal(leaderboard.entries[3].id, users[3].id);
    assert.equal(leaderboard.entries[4].id, users[1].id);
  });
});

describe("Leaderboard.toString", () => {

  const users = [
    new User(0, "user0", 15),
    new User(1, "user1", 5),
    new User(2, "user2", 20),
    new User(3, "user3", 10),
  ];

  it("should not print any arrows when no old leaderboard is supplied", () => {

    // Arrange
    const newLeaderboard = new Leaderboard(users);
    const expected = "\n<b>1.</b>    user2    20     \n<b>2.</b>    user0    15     \n"
      + "<b>3.</b>    user3    10     \n<b>4.</b>    user1    5     ";

    // Act
    const stringified = newLeaderboard.toString();

    // Assert
    assert.equal(stringified, expected);
  });

  it("should not print any arrows when old leaderboard is supplied but rankings are unchanged", () => {

    // Arrange
    const newLeaderboard = new Leaderboard(users);
    const oldLeaderboard = new Leaderboard(users.slice(0, users.length));
    const expected = "\n<b>1.</b>    user2    20     \n<b>2.</b>    user0    15     \n"
      + "<b>3.</b>    user3    10     \n<b>4.</b>    user1    5     ";

    // Act
    const stringified = newLeaderboard.toString(oldLeaderboard);

    // Assert
    assert.equal(stringified, expected);

  });

  it("should not print arrows for a new user nor for users higher ranking than them,"
    + " but should print arrows for users lower ranking than them", () => {

      // Arrange
      const newUsers = [new User(4, "user4", 15)].concat(...users.slice(0, users.length));
      const newLeaderboard = new Leaderboard(newUsers);
      const oldLeaderboard = new Leaderboard(users);
      const expected = "\n<b>1.</b>    user2    20     \n<b>2.</b>    user0    15     \n"
        + "<b>3.</b>    user4    15     \n<b>4.</b>    user3    10     ⬇️\n<b>5.</b>    user1    5     ⬇️";

      // Act
      const stringified = newLeaderboard.toString(oldLeaderboard);

      // Assert
      assert.equal(stringified, expected);

    });

  it("should print appropriate up and down arrows when users score", () => {

    // Arrange
    const oldLeaderboard = new Leaderboard(users);
    const newLeaderboard = new Leaderboard([
      new User(0, "user0", 25, 100, false, 10),
      new User(1, "user1", 5, 100, false, 0),
      new User(2, "user2", 20, 100, false, 0),
      new User(3, "user3", 22, 100, false, 12),
    ]);
    const expected = "\n<b>1.</b>    user0    25 (+10)    ⬆️\n<b>2.</b>    user3    22 (+12)    ⬆️\n"
      + "<b>3.</b>    user2    20     ⬇️⬇️\n<b>4.</b>    user1    5     ";

    // Act
    const stringified = newLeaderboard.toString(oldLeaderboard);

    // Assert
    assert.equal(stringified, expected);

  });

  it("should not print arrows for users higher ranking than a leaving user,"
    + " but should print arrows for users lower ranking than them", () => {

      // Arrange
      const oldUsers = [new User(4, "user4", 16)].concat(...users.slice(0, users.length));
      const oldLeaderboard = new Leaderboard(oldUsers);
      const newLeaderboard = new Leaderboard(users);
      const expected = "\n<b>1.</b>    user2    20     \n<b>2.</b>    user0    15     ⬆️\n"
        + "<b>3.</b>    user3    10     ⬆️\n<b>4.</b>    user1    5     ⬆️";

      // Act
      const stringified = newLeaderboard.toString(oldLeaderboard);

      // Assert
      assert.equal(stringified, expected);
    });

});
