'use strict';

// Imports.
const assert = require('assert');
const User = require('../src/user.js');
const Leaderboard = require('../src/leaderboard.js');

// Unit test.
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