'use strict';

// Imports.
const User = require('./user.js');

/**
 * Represents a leaderboard.
 */
class Leaderboard {

  /**
   * Constructs a new leaderboard from the supplied iterator of users.
   * @param {IterableIterator<User>} users 
   */
  constructor(users = null) {
    this._entries = [];
    if (users) {
      let user = users.next();
      while (!user.done) {
        this.addEntry(user.value);
        user = users.next();
      }
    }
  }

  /**
   * Adds a new user to this leaderboard.
   * @param {User} user 
   */
  addEntry(user) {
    const newEntry = new LeaderboardEntry(user);
    for (let i = 0; i < this._entries.length; i++) {
      if (this._entries[i].compare(newEntry) > 0) {
        const moveMeUp = this._entries.splice(i);
        this._entries.push(newEntry);
        this._entries.push(...moveMeUp);
        return;
      }
    }
    this._entries.push(newEntry);
  }

  /**
   * Gets the index of the entry that has the specified user id. If no such user exists, returns undefined.
   * @param {number} userId 
   */
  _indexOfEntryViaUserId(userId) {
    for (let i = 0; i < this._entries.length; i++) {
      if (this._entries[i].id === userId) {
        return i;
      }
    }
    return undefined;
  }

  /**
   * Returns a string representation of this leaderboard.
   * @param {Leaderboard} previous The previous leaderboard, or null.
   * @returns {string}
   */
  toString(previous = null) {

    // Calculate position changes.
    const positionChanges = new Map();
    if (previous) {
      for (let currentPosition = 0; currentPosition < this._entries.length; currentPosition++) {
        const currentEntry = this._entries[currentPosition];
        const oldPosition = previous._indexOfEntryViaUserId(currentEntry.id);

        if (oldPosition > 0 || oldPosition < 0) {
          positionChanges.set(currentEntry.id, oldPosition - currentPosition);
        }
      }
    }

    // Construct string leaderboard.
    let leaderboard = '';
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i];
      const positionChange = positionChanges.get(entry.id);
      const positionChangeStr = positionChange > 0 ? '(+' + positionChange + ')' : positionChange < 0 ? '(' + positionChange + ')' : '';
      const scoreChange = entry.lastScoreChange > 0 ? '(+' + entry.lastScoreChange + ')' : entry.lastScoreChange < 0 ? '(' + entry.lastScoreChange + ')' : '';
      leaderboard += '\n<b>' + (i + 1) + '.</b> ' + positionChangeStr + '    ' + entry.name + '    ' + entry.score + ' ' + scoreChange;
    }
    return leaderboard;
  }
}

/**
 * Represents an entry in the leaderboard.
 */
class LeaderboardEntry {
  constructor(user) {
    this.id = user.getId();
    this.name = user.getName();
    this.score = user.getScore();
    this.lastScoreChange = user.getLastScoreChange();
  }

  /**
   * Compares this leaderboard entry to another one, using their score and name.
   * @param {LeaderboardEntry} other
   * @returns {number}
   */
  compare(other) {
    return LeaderboardEntry.compare(this, other);
  }

  /**
   * Compares two leaderboard entries using their score and name.
   * @param {LeaderboardEntry} a
   * @param {LeaderboardEntry} b
   * @returns {number}
   */
  static compare(a, b) {
    if (a.score > b.score) {
      return -1;
    }
    if (a.score < b.score) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };
}

// Exports.
module.exports = Leaderboard;