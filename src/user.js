'use strict';

/**
 * Represents a Telegram user.
 */
class User {

    /**
     * Creates a new user object.
     * @param {number} id The unique Telegram user's id.
     * @param {string} name The Telegram user's name.
     * @param {number} score The user's DankTimes score.
     * @param {boolean} called Whether the user called the last dank time already.
     * @param {number} lastScoreChange The last change to the user's score.
     */
    constructor(id, name, score = 0, called = false, lastScoreChange = 0) {
        if (typeof id !== 'number' || id % 1 !== 0) {
            throw TypeError('The id must be a whole number!');
        }
        this._id = id;
        this.setName(name);
        if (typeof score !== 'number' || score % 1 !== 0) {
            throw TypeError('The score must be a whole number!');
        }
        this._score = score;
        this.setCalled(called);
        if (typeof lastScoreChange !== 'number' || lastScoreChange % 1 !== 0) {
            throw TypeError('The last score change must be a whole number!');
        }
        this._lastScoreChange = lastScoreChange;
    }

    /**
     * Sets the Telegram user's name.
     * @param {string} newname
     */
    setName(newname) {
        if (typeof newname !== 'string') {
            throw TypeError('The name must be a string!');
        }
        this._name = newname;
    };

    /**
     * Sets whether the user called the last dank time already.
     * @param {boolean} newcalled
     */
    setCalled(newcalled) {
        if (typeof newcalled !== 'boolean') {
            throw TypeError('The called state must be a boolean!');
        }
        this._called = newcalled;
    };

    /**
     * Gets the unique Telegram user's id.
     * @returns {number}
     */
    getId() {
        return this._id;
    };

    /**
     * Gets the Telegram user's name.
     * @returns {string}
     */
    getName() {
        return this._name;
    };

    /**
     * Gets the user's DankTimes score.
     * @returns {number}
     */
    getScore() {
        return this._score;
    };

    /**
     * Adds an amount to the user's DankTimes score.
     * @param {number} amount May be negative.
     */
    addToScore(amount) {
        if (typeof amount !== 'number' || amount % 1 !== 0) {
            throw TypeError('The amount must be a whole number!');
        }
        this._score += amount;
        this._lastScoreChange += amount;
    };

    /**
     * Resets the DankTimes score.
     */
    resetScore() {
        this._score = 0;
        this._lastScoreChange = 0;
        this._called = false;
    };

    /**
     * Gets whether the user called the last dank time already.
     * @returns {boolean} 
     */
    getCalled() {
        return this._called;
    };

    /**
     * Gets the last change to the user's score.
     * @returns {number}
     */
    getLastScoreChange() {
        return this._lastScoreChange;
    };

    /**
     * Resets the last change to the user's score.
     */
    resetLastScoreChange() {
        this._lastScoreChange = 0;
    };

    /**
     * Used by JSON.stringify. Returns a literal representation of this.
     * @return {Object}
     */
    toJSON() {
        return { id: this._id, name: this._name, score: this._score,
            called: this._called, lastScoreChange: this._lastScoreChange };
    };

    /**
     * Returns a new User parsed from a literal.
     * @param {Object} literal
     * @returns {User}
     */
    static fromJSON(literal) {
        return new User(literal.id, literal.name, literal.score, literal.called, literal.lastScoreChange);
    };

    /**
     * Compares two users using their score and name. Used for sorting collections.
     * @param {User} a
     * @param {User} b
     * @returns {number}
     */
    static compare(a, b) {
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
};

// Exports.
module.exports = User;
