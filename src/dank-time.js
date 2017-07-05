'use strict';

/**
 * Represents a dank time.
 */
class DankTime {

    /**
     * Creates a new dank time object.
     * @param {number} hour The hour at which points can be scored.
     * @param {number} minute The minute at which points can be scored.
     * @param {string[]} texts The texts to shout at the hour:minute to score points.
     * @param {number} points The amount of points to reward or confiscate.
     */
    constructor(hour, minute, texts, points = 1) {
        this.setHour(hour);
        this.setMinute(minute);
        this.setPoints(points);
        this.setTexts(texts);
    }

    /**
     * Sets the hour.
     * @param {number} newhour
     */
    setHour(newhour) {
        if (typeof newhour !== 'number' || newhour < 0 || newhour > 23 || newhour % 1 !== 0) {
            throw TypeError('The hour must be a whole number between 0 and 23!');
        }
        this._hour = newhour;
    };

    /**
     * Sets the minute.
     * @param {number} newminute
     */
    setMinute(newminute) {
        if (typeof newminute !== 'number' || newminute < 0 || newminute > 59 || newminute % 1 !== 0) {
            throw TypeError('The minute must be a whole number between 0 and 59!');
        }
        this._minute = newminute;
    };

    /**
     * Sets the points.
     * @param {number} newpoints
     */
    setPoints(newpoints) {
        if (typeof newpoints !== 'number' || newpoints < 1 || newpoints % 1 !== 0) {
            throw TypeError('The points must be a whole number greater than 0!');
        }
        this._points = newpoints;
    };

    /**
     * Sets the texts.
     * @param {string[]} newtexts
     */
    setTexts(newtexts) {
        if (!(newtexts instanceof Array) || newtexts.length < 1) {
            throw TypeError('The texts must be a string array containing at least one item!');
        }
        newtexts.forEach(entry => {
            if (typeof entry !== 'string') {
                throw TypeError('The texts must contain only strings!');
            }
        });
        this._texts = newtexts;
    };

    /**
     * Gets the texts.
     * @returns {string[]}
     */
    getTexts() {
        return this._texts;
    };

    /**
     * Gets the points.
     * @returns {number}
     */
    getPoints() {
        return this._points;
    };

    /**
     * Gets the minute.
     * @returns {number}
     */
    getMinute() {
        return this._minute;
    };

    /**
     * Gets the hour.
     * @returns {number}
     */
    getHour() {
        return this._hour;
    };

    /**
     * Checks whether this instance contains the text (case-insensitive).
     * @param {string} text 
     * @returns True if this instance contains the text, otherwise false.
     */
    hasText(text) {
        text = text.toUpperCase();
        for (let text2 of this._texts) {
            if (text2.toUpperCase() === text) {
                return true;
            }
        }
        return false;
    };

    /**
     * Used by JSON.stringify. Returns a literal representation of this.
     * @return {Object}
     */
    toJSON() {
        return { hour: this._hour, minute: this._minute, texts: this._texts, points: this._points };
    };

    /**
     * Returns a new DankTime parsed from a literal.
     * @param {Object} literal
     * @returns {DankTime}
     */
    static fromJSON(literal) {
        return new DankTime(literal.hour, literal.minute, literal.texts, literal.points);
    };

    /**
     * Compares two dank times using their hour and minute. Used for sorting collections.
     * @param {DankTime} a
     * @param {DankTime} b
     * @returns {number}
     */
    static compare(a, b) {
        if (a.getHour() < b.getHour()) {
            return -1;
        }
        if (a.getHour() > b.getHour()) {
            return 1;
        }
        if (a.getMinute() < b.getMinute()) {
            return -1;
        }
        if (a.getMinute() > b.getMinute()) {
            return 1;
        }
        return 0;
    };
}

// Exports.
module.exports = DankTime;