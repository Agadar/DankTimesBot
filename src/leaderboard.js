'use strict';

// Imports.
const User = require('./user.js');

/**
 * Represents a leaderboard.
 */
class Leaderboard {

  /**
   * Constructs a new leaderboard from the supplied collection of users.
   * @param {User[]} users 
   */
  constructor(users = []) {
    this._entries = [];
    users.forEach(user => this.addEntry(user));
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
   * Returns a string representation of this leaderboard.
   */
  toString() {

  }

  /**
   * Returns the ordered entries of this leaderboard.
   * @returns {LeaderboardEntry[]}
   */
  getEntries() {
    return this._entries;
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