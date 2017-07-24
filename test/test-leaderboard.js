'use strict';

// Imports.
const assert = require('assert');
const User = require('../src/user.js');
const Leaderboard = require('../src/leaderboard.js');

// Unit tests.

describe('constructor', function () {
  it('should have created an ordered leaderboard', function () {
    const users = [
      new User(0, 'user0', 15),
      new User(1, 'user1', 5),
      new User(2, 'user2', 20),
      new User(3, 'user3', 10)
    ];
    const leaderboard = new Leaderboard(users);
    assert.equal(leaderboard._entries[0].id, users[2].getId());
    assert.equal(leaderboard._entries[1].id, users[0].getId());
    assert.equal(leaderboard._entries[2].id, users[3].getId());
    assert.equal(leaderboard._entries[3].id, users[1].getId());
  });
});

describe('_indexOfEntryViaUserId', function () {
  const leaderboard = new Leaderboard([
    new User(2, 'user2', 20),
    new User(0, 'user0', 15),
    new User(3, 'user3', 10),
    new User(1, 'user1', 5)
  ]);

  it('should retrieve the correct index (0)', function () {
    assert.equal(leaderboard._indexOfEntryViaUserId(0), 1);
  });

  it('should retrieve the correct index (1)', function () {
    assert.equal(leaderboard._indexOfEntryViaUserId(1), 3);
  });

  it('should retrieve the correct index (2)', function () {
    assert.equal(leaderboard._indexOfEntryViaUserId(2), 0);
  });

  it('should retrieve the correct index (3)', function () {
    assert.equal(leaderboard._indexOfEntryViaUserId(3), 2);
  });

  it('should retrieve the correct index (4)', function () {
    assert.equal(leaderboard._indexOfEntryViaUserId(4), undefined);
  });
});

describe('_calculatePositionChanges', function () {
  const previousLeaderboard = new Leaderboard([
    new User(2, 'user2', 20),
    new User(0, 'user0', 15),
    new User(3, 'user3', 10),
    new User(1, 'user1', 5),
    new User(4, 'user4', 0)
  ]);
  const currentLeaderboard = new Leaderboard([
    new User(0, 'user0', 15),
    new User(1, 'user1', 10),
    new User(2, 'user2', 10),
    new User(3, 'user3', 10),
    new User(4, 'user4', 0)
  ]);
  const changes = currentLeaderboard._calculatePositionChanges(previousLeaderboard);

  it('should contain the right number of values', function () {
    assert.equal(changes.size, 4);
  });

  it('should contain the correct entries', function () {
    assert.equal(changes.get(2), -2);
    assert.equal(changes.get(0), 1);
    assert.equal(changes.get(3), -1);
    assert.equal(changes.get(1), 2);
  });
});