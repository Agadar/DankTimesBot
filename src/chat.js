'use strict';

// Imports.
const time = require('time')(Date);            // NodeJS library for working with timezones.
const util = require('./util.js');             // Custom script containing global utility functions.
const DankTime = require('./dank-time.js');
const User = require('./user.js');

/**
 * Represents a Telegram chat.
 */
class Chat {

  /**
   * Creates a new Chat object.
   * @param {number} id The chat's unique Telegram id.
   * @param {string} timezone The timezone the users are in.
   * @param {boolean} running Whether this bot is running for this chat.
   * @param {number} numberOfRandomTimes The number of randomly generated dank times to generate each day.
   * @param {number} pointsPerRandomTime The number of points each randomly generated dank time is worth.
   * @param {number} lastHour The hour of the last valid dank time being proclaimed.
   * @param {number} lastMinute The minute of the last valid dank time being proclaimed.
   * @param {User[]} users A map with the users, indexed by user id's.
   * @param {DankTime[]} dankTimes The dank times known in this chat.
   * @param {DankTime[]} randomDankTimes The daily randomly generated dank times in this chat.
   * @param {boolean} notifications Whether or not this chat automatically sends notifications for dank times.
   */
  constructor(id, timezone = 'Europe/Amsterdam', running = false, numberOfRandomTimes = 1, pointsPerRandomTime = 10,
    lastHour = 0, lastMinute = 0, users = new Map(), dankTimes = [], randomDankTimes = [], notifications = true) {
    if (typeof id !== 'number' || id % 1 !== 0) {
      throw TypeError('The id must be a whole number!');
    }
    this._id = id;
    this.setTimezone(timezone);
    this.setRunning(running);
    this.setLastHour(lastHour);
    this.setLastMinute(lastMinute);
    if (!(users instanceof Map)) {
      throw TypeError('The users must be a map!');
    }
    this._users = users;
    if (!(dankTimes instanceof Array)) {
      throw TypeError('The dank times must be a array!');
    }
    this._dankTimes = dankTimes;
    if (!(randomDankTimes instanceof Array)) {
      throw TypeError('The random dank times must be a array!');
    }
    this._randomDankTimes = randomDankTimes;
    this.setNumberOfRandomTimes(numberOfRandomTimes);
    this.setPointsPerRandomTime(pointsPerRandomTime);
    this._awaitingResetConfirmation = undefined;
    this.setNotifications(notifications);
  }

  /**
   * Gets this chat's unique Telegram id.
   * @returns {number}
   */
  getId() {
    return this._id;
  }

  /**
   * Sets whether or not this chat automatically sends notifications for dank times.
   * @param {boolean} notifications
   */
  setNotifications(notifications) {
    if (typeof notifications !== 'boolean') {
      throw TypeError('The notifications value must be a boolean!');
    }
    this._notifications = notifications;
  }

  /**
   * Gets whether or not this chat automatically sends notifications for dank times.
   * @returns {boolean}
   */
  getNotifications() {
    return this._notifications;
  }

  /**
   * Sets the timezone the users are in.
   * @param {string} newtimezone
   */
  setTimezone(newtimezone) {
    try {
      new Date().setTimezone(newtimezone);
    } catch (err) {
      throw RangeError('Invalid timezone! Examples: \'Europe/Amsterdam\', \'UTC\'.');
    }
    this._timezone = newtimezone;
  };

  /**
   * Sets whether this bot is running for this chat.
   * @param {boolean} newrunning
   */
  setRunning(newrunning) {
    if (typeof newrunning !== 'boolean') {
      throw TypeError('The running state must be a boolean!');
    }
    this._running = newrunning;
  };

  /**
   * Sets the number of randomly generated dank times to generate each day.
   * @param {number} newnumberOfRandomTimes
   * @returns {DankTime[]} The removed times if the old number was > than the new number.
   */
  setNumberOfRandomTimes(newnumberOfRandomTimes) {
    if (typeof newnumberOfRandomTimes !== 'number' || newnumberOfRandomTimes < 0 || newnumberOfRandomTimes % 1 !== 0) {
      throw TypeError('The number of times must be a whole number greater or equal to 0!');
    }
    this._numberOfRandomTimes = newnumberOfRandomTimes;
    return this._randomDankTimes.splice(newnumberOfRandomTimes)
  };

  /**
   * Sets the number of points each randomly generated dank time is worth.
   * @param {number} newpointsPerRandomTime
   */
  setPointsPerRandomTime(newpointsPerRandomTime) {
    if (typeof newpointsPerRandomTime !== 'number' || newpointsPerRandomTime < 1 || newpointsPerRandomTime % 1 !== 0) {
      throw TypeError('The points must be a whole number greater than 0!');
    }
    this._pointsPerRandomTime = newpointsPerRandomTime;

    // Update existing random times.
    this._randomDankTimes.forEach(time => time.setPoints(newpointsPerRandomTime));
  };

  /**
   * Sets the hour of the last valid dank time being proclaimed.
   * @param {number} newlastHour
   */
  setLastHour(newlastHour) {
    if (typeof newlastHour !== 'number' || newlastHour < 0 || newlastHour > 23 || newlastHour % 1 !== 0) {
      throw TypeError('The hour must be a whole number between 0 and 23!');
    }
    this._lastHour = newlastHour;
  };

  /**
   * Sets the minute of the last valid dank time being proclaimed.
   * @param {number} newlastMinute
   */
  setLastMinute(newlastMinute) {
    if (typeof newlastMinute !== 'number' || newlastMinute < 0 || newlastMinute > 59 || newlastMinute % 1 !== 0) {
      throw TypeError('The minute must be a whole number between 0 and 59!');
    }
    this._lastMinute = newlastMinute;
  };

  /**
   * Adds a new normal dank time to this chat, replacing any dank time that has
   * the same hour and minute.
   * @param {DankTime} dankTime
   */
  addDankTime(dankTime) {
    const existing = this.getDankTime(dankTime.getHour(), dankTime.getMinute());
    if (existing) {
      this._dankTimes.splice(this._dankTimes.indexOf(existing), 1);
    }
    this._dankTimes.push(dankTime);
  };

  /**
   * Adds a user to this chat.
   * @param {User} user The user to add.
   */
  addUser(user) {
    this._users.set(user.id, user);
  };

  /**
   * Gets the timezone the users are in.
   * @returns {string}
   */
  getTimezone() {
    return this._timezone;
  };

  /**
   * Gets whether this bot is running for this chat.
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  };

  /**
   * Gets the number of randomly generated dank times to generate each day.
   * @returns {number}
   */
  getNumberOfRandomTimes() {
    return this._numberOfRandomTimes;
  };

  /**
   * Gets the number of points each randomly generated dank time is worth.
   * @returns {number}
   */
  getPointsPerRandomTime() {
    return this._pointsPerRandomTime;
  };

  /**
   * Gets the hour of the last valid dank time being proclaimed.
   * @returns {number}
   */
  getLastHour() {
    return this._lastHour;
  };

  /**
   * Gets the minute of the last valid dank time being proclaimed.
   * @returns {number}
   */
  getLastMinute() {
    return this._lastMinute;
  };

  /**
   * Gets an array of the dank times, sorted by hour and minute.
   * @returns {DankTime[]}
   */
  getDankTimes() {
    const timesArr = []
    this._dankTimes.forEach(time => timesArr.push(time));
    timesArr.sort(DankTime.compare);
    return timesArr;
  };

  /**
   * Gets an unsorted array of the random dank times.
   * @returns {DankTime[]}
   */
  getRandomDankTimes() {
    return this._randomDankTimes;
  };

  /**
   * Gets an array of the users, sorted by scores.
   * @returns {User[]}
   */
  getUsers() {
    const usersArr = [];
    this._users.forEach(user => usersArr.push(user));
    usersArr.sort(User.compare);
    return usersArr;
  };

  /**
   * Generates new random dank times for this chat, clearing old ones.
   * @returns {DankTime[]} The generated dank times.
   */
  generateRandomDankTimes() {
    this._randomDankTimes = [];

    for (let i = 0; i < this._numberOfRandomTimes; i++) {
      const date = new Date();
      date.setHours(date.getHours() + Math.floor(Math.random() * 23));
      date.setMinutes(Math.floor(Math.random() * 59));
      date.setTimezone(this._timezone);
      const text = util.padNumber(date.getHours().toString()) + util.padNumber(date.getMinutes().toString());
      this._randomDankTimes.push(new DankTime(date.getHours(), date.getMinutes(), [text], this._pointsPerRandomTime));
    }
    return this._randomDankTimes;
  };

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   * @return {Object}
   */
  toJSON() {
    const usersArr = [];
    this._users.forEach(user => usersArr.push(user));
    return {
      id: this._id, timezone: this._timezone, running: this._running, numberOfRandomTimes: this._numberOfRandomTimes,
      pointsPerRandomTime: this._pointsPerRandomTime, lastHour: this._lastHour, lastMinute: this._lastMinute, users: usersArr,
      dankTimes: this._dankTimes, randomDankTimes: this._randomDankTimes, notifications: this._notifications
    };
  };

  /**
   * Processes a message, awarding or punishing points etc. where applicable.
   * @param {number} userId
   * @param {string} userName
   * @param {string} msgText
   * @param {number} msgUnixTime
   * @returns {string} A reply, or nothing if no reply is suitable/needed.
   */
  processMessage(userId, userName, msgText, msgUnixTime) {

    // Ignore the message if it was sent more than 1 minute ago.
    const serverDate = new Date();
    serverDate.setTimezone(this._timezone);
    msgUnixTime *= 1000;
    if (serverDate.getTime() - msgUnixTime >= 60 * 1000) {
      return;
    }
    msgText = util.cleanText(msgText);

    // If we are awaiting reset confirmation...
    if (this._awaitingResetConfirmation === userId) {
      this._awaitingResetConfirmation = undefined;
      if (msgText.toUpperCase() === 'YES') {
        const message = 'Leaderboard has been reset!\n\n' + this.generateLeaderboard(true);
        this._users.forEach(user => user.resetScore());
        return message;
      }
    }

    // If this chat isn't running, don't check anything else.
    if (!this._running) {
      return;
    }

    // Gather dank times from the sent text, returning if none was found.
    const dankTimesByText = this._getDankTimesByText(msgText);
    if (dankTimesByText.length < 1) {
      return;
    }

    // Get the player, creating him if he doesn't exist yet.
    if (!this._users.has(userId)) {
      this._users.set(userId, new User(userId, userName));
    }
    const user = this._users.get(userId);

    // Update user name if needed.
    if (user.getName() !== userName) {
      user.setName(userName);
    }

    let subtractBy = 0;
    for (let dankTime of dankTimesByText) {
      if (serverDate.getHours() === dankTime.getHour() && (serverDate.getMinutes() === dankTime.getMinute()
        || new Date(msgUnixTime).getMinutes() === dankTime.getMinute())) {

        // If cache needs resetting, do so and award DOUBLE points to the calling user.
        if (this._lastHour !== dankTime.getHour() || this._lastMinute !== dankTime.getMinute()) {
          this._users.forEach(user => user.setCalled(false));
          this._lastHour = dankTime.getHour();
          this._lastMinute = dankTime.getMinute();
          user.addToScore(dankTime.getPoints() * 2);
          user.setCalled(true);
        } else if (user.getCalled()) { // Else if user already called this time, remove points.
          user.addToScore(-dankTime.getPoints());
        } else {  // Else, award point.
          user.addToScore(dankTime.getPoints());
          user.setCalled(true);
        }
        return;
      } else if (dankTime.getPoints() > subtractBy) {
        subtractBy = dankTime.getPoints();
      }
    }
    // If no match was found, punish the user.
    user.addToScore(-subtractBy);
  };

  /**
   * Sets this chat's awaitingResetConfirmation value, which is the
   * id of the user whose confirmation is awaited.
   * @param {number} awaitingResetConfirmation 
   */
  setAwaitingResetConfirmation(awaitingResetConfirmation) {
    if (awaitingResetConfirmation && typeof awaitingResetConfirmation !== 'number') {
      throw TypeError('The value must be a number or undefined!');
    }
    this._awaitingResetConfirmation = awaitingResetConfirmation;
  };

  /**
   * Resets the scores of all the users.
   */
  resetScores() {
    this._users.forEach(user => user.resetScore());
  };

  /**
   * Removes the dank time with the specified hour and minute.
   * @param {number} hour
   * @param {number} minute
   * @returns {boolean} Whether a dank time was found and removed.
   */
  removeDankTime(hour, minute) {
    const dankTime = this.getDankTime(hour, minute);
    if (dankTime) {
      this._dankTimes.splice(this._dankTimes.indexOf(dankTime));
      return true;
    }
    return false;
  };

  /**
   * Returns whether the leaderboard has changed since the last time this.generateLeaderboard(...) was generated.
   * @returns {boolean}
   */
  leaderboardChanged() {
    for (const user of this._users) {
      if (user[1].getLastScoreChange() !== 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generates the leaderboard of this chat.
   * @param {boolean} final If true, prints 'FINAL LEADERBOARD' instead of 'LEADERBOARD'.
   * @returns {string} The leaderboard.
   */
  generateLeaderboard(final = false) {
    let leaderboard = '<b>--- ' + (final ? 'FINAL ' : '') + 'LEADERBOARD ---</b>\n';
    for (const userEntry of this.getUsers()) {
      const user = userEntry;
      const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' : (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
      leaderboard += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
      user.resetLastScoreChange();
    }
    return leaderboard;
  }

  /**
   * Gets the normal dank time that has the specified hour and minute.
   * @param {number} hour 
   * @param {number} minute 
   * @returns {DankTime} or undefined if none has the specified hour and minute.
   */
  getDankTime(hour, minute) {
    for (let dankTime of this._dankTimes) {
      if (dankTime.getHour() === hour && dankTime.getMinute() === minute) {
        return dankTime;
      }
    }
  };

  /**
   * Gets both normal and random dank times that have the specified text.
   * @param {string} text 
   * @returns {DankTime[]}
   */
  _getDankTimesByText(text) {
    const found = [];
    for (let dankTime of this._dankTimes.concat(this._randomDankTimes)) {
      if (dankTime.hasText(text)) {
        found.push(dankTime);
      }
    }
    return found;
  };

  /**
   * Returns a new Chat parsed from a literal.
   * @param {Object} literal
   * @returns {Chat}
   */
  static fromJSON(literal) {

    // For backwards compatibility with v.1.0.0.
    if (!literal.lastHour || !literal.lastMinute) {
      literal.lastHour = 0;
      literal.lastMinute = 0;

      for (let dankTime of literal.dankTimes) {
        if (!dankTime.texts) {
          dankTime.texts = [dankTime.shoutout];
          delete dankTime.shoutout;
        }
      }
      for (let dankTime of literal.randomDankTimes) {
        if (!dankTime.texts) {
          dankTime.texts = [dankTime.shoutout];
          delete dankTime.shoutout;
        }
      }
      literal.notifications = true;
    }

    const dankTimes = [];
    literal.dankTimes.forEach(dankTime => dankTimes.push(DankTime.fromJSON(dankTime)));

    const randomDankTimes = [];
    literal.randomDankTimes.forEach(dankTime => randomDankTimes.push(DankTime.fromJSON(dankTime)));

    const users = new Map();
    literal.users.forEach(user => users.set(user.id, User.fromJSON(user)));

    return new Chat(literal.id, literal.timezone, literal.running, literal.numberOfRandomTimes, literal.pointsPerRandomTime,
      literal.lastHour, literal.lastMinute, users, dankTimes, randomDankTimes, literal.notifications);
  };
}

// Exports.
module.exports = Chat;