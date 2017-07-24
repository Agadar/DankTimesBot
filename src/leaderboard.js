'use strict';

// Imports.
const User = require('./user.js');

/**
 * Represents a leaderboard.
 */
class Leaderboard {

  /**
   * Constructs a new leaderboard from the supplied array of users.
   * @param {User[]} users 
   */
  constructor(users = null) {
    this._entries = [];
    if (users) {
      users.forEach(user => {
        this.addEntry(user);
      });
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
   * Calculates the position changes by comparing this leaderboard to a previous one.
   * @param {Leaderboard} previousLeaderboard 
   * @returns {Map<number,number>} The position changes, mapped to user id's.
   */
  _calculatePositionChanges(previousLeaderboard) {
    const positionChanges = new Map();
    if (!previousLeaderboard) {
      return positionChanges;
    }
    for (let currentPosition = 0; currentPosition < this._entries.length; currentPosition++) {
      const currentEntry = this._entries[currentPosition];
      const oldPosition = previousLeaderboard._indexOfEntryViaUserId(currentEntry.id);
      const change = oldPosition - currentPosition;
      if (change > 0 || change < 0) {
        positionChanges.set(currentEntry.id, change);
      }
    }
    return positionChanges;
  }

  /**
   * Returns a string representation of this leaderboard.
   * @param {Leaderboard} previous The previous leaderboard, or null.
   * @returns {string}
   */
  toString(previous = null) {
    const positionChanges = this._calculatePositionChanges(previous);
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