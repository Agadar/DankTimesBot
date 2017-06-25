'use strict';

/**
 * Creates a new user object.
 * @param {number} id The unique Telegram user's id.
 * @param {string} name The Telegram user's name.
 * @param {number} score The user's DankTimes score.
 * @param {boolean} called Whether the user called the last dank time already.
 * @param {number} lastScoreChange The last change to the user's score.
 */
function User(id, name, score = 0, called = false, lastScoreChange = 0) {

    /**
     * Sets the Telegram user's name.
     * @param {string} newname
     */
    this.setName = function(newname) {
        if (typeof newname !== 'string') {
            throw TypeError('The name must be a string!');
        }
        name = newname;
    };

    /**
     * Sets whether the user called the last dank time already.
     * @param {boolean} newcalled
     */
    this.setCalled = function(newcalled) {
        if (typeof newcalled !== 'boolean') {
            throw TypeError('The called state must be a boolean!');
        }
        called = newcalled;
    };

    // 'Constructor'  
    if (typeof id !== 'number' || id % 1 !== 0) {
        throw TypeError('The id must be a whole number!');
    }
    this.setName(name);
    if (typeof score !== 'number' || score % 1 !== 0) {
        throw TypeError('The score must be a whole number!');
    }
    this.setCalled(called);
    if (typeof lastScoreChange !== 'number' || lastScoreChange % 1 !== 0) {
        throw TypeError('The last score change must be a whole number!');
    }

    /**
     * Gets the unique Telegram user's id.
     * @returns {number}
     */
    this.getId = function() {
        return id;
    };

    /**
     * Gets the Telegram user's name.
     * @returns {string}
     */
    this.getName = function() {
        return name;
    };

    /**
     * Gets the user's DankTimes score.
     * @returns {number}
     */
    this.getScore = function() {
        return score;
    };

    /**
     * Adds an amount to the user's DankTimes score.
     * @param {number} amount May be negative.
     */
    this.addToScore = function(amount) {
        if (typeof amount !== 'number' || amount % 1 !== 0) {
            throw TypeError('The amount must be a whole number!');
        }
        score += amount;
        lastScoreChange += amount;
    };

    /**
     * Resets the DankTimes score.
     */
    this.resetScore = function() {
        score = 0;
        lastScoreChange = 0;
        called = false;
    };

    /**
     * Gets whether the user called the last dank time already.
     * @returns {boolean} 
     */
    this.getCalled = function() {
        return called;
    };

    /**
     * Gets the last change to the user's score.
     * @returns {number}
     */
    this.getLastScoreChange = function() {
        return lastScoreChange;
    };

    /**
     * Resets the last change to the user's score.
     */
    this.resetLastScoreChange = function() {
        lastScoreChange = 0;
    };

    /**
     * Used by JSON.stringify. Returns a literal representation of this.
     * @return {Object}
     */
    this.toJSON = function() {
        return {id: id, name: name, score: score, called: called, lastScoreChange: lastScoreChange};
    };
};

/**
 * Returns a new User parsed from a literal.
 * @param {Object} literal
 * @returns {User}
 */
User.fromJSON = function(literal) {
    return new User(literal.id, literal.name, literal.score, literal.called, literal.lastScoreChange);
};

/**
 * Compares two users using their score and name. Used for sorting collections.
 * @param {User} a
 * @param {User} b
 * @returns {number}
 */
User.compare = function(a, b) {
  if (a.getScore() > b.getScore()) {
    return -1;
  }
  if (a.getScore() < b.getScore()) {
    return 1;
  }
  if (a.getName() < b.getName()) {
    return -1;
  }
  if (a.getName() > b.getName()) {
    return 1;
  }
  return 0;
};

// Exports.
module.exports = User;
