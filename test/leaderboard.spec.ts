import 'mocha';
import assert = require('assert');
import { User } from '../src/user';
import { Leaderboard } from '../src/leaderboard';

describe('Leaderboard.constructor', () => {
  it('should have created an ordered leaderboard', function () {
    const users = [
      new User(0, 'user0', 15),
      new User(1, 'user1', 5),
      new User(2, 'user2', 20),
      new User(3, 'user3', 10)
    ];
    const leaderboard = new Leaderboard(users);
    assert.equal(leaderboard.entries[0].id, users[2].id);
    assert.equal(leaderboard.entries[1].id, users[0].id);
    assert.equal(leaderboard.entries[2].id, users[3].id);
    assert.equal(leaderboard.entries[3].id, users[1].id);
  });
});
