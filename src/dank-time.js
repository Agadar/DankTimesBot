'use strict';

// Exports.
module.exports = DankTime;

/**
 * Creates a new dank time object.
 * @param {number} hour The hour at which points can be scored.
 * @param {number} minute The minute at which points can be scored.
 * @param {string[]} texts The texts to shout at the hour:minute to score points.
 * @param {number} points The amount of points to reward or confiscate.
 */
function DankTime(hour, minute, texts, points = 1) {

    /**
     * Gets the hour.
     * @returns {number}
     */
    this.getHour = function() {
        return hour;
    };

    /**
     * Sets the hour. Throws error if invalid value.
     * @param {number} newhour
     */
    this.setHour = function(newhour) {
        if (newhour === NaN || newhour < 0 || newhour > 23 || newhour % 1 !== 0) {
            throw new RangeError('The hour must be a whole number between 0 and 23!');
        }
        hour = newhour;
    };

    /**
     * Gets the minute.
     * @returns {number}
     */
    this.getMinute = function() {
        return minute;
    };

    /**
     * Sets the minute. Throws error if invalid value.
     * @param {number} newminute
     */
    this.setMinute = function(newminute) {
        if (newminute === NaN || newminute < 0 || newminute > 59 || newminute % 1 !== 0) {
            throw new RangeError('The minute must be a whole number between 0 and 59!');
        }
        minute = newminute;
    };

    /**
     * Gets the points.
     * @returns {number}
     */
    this.getPoints = function() {
        return points;
    };

    /**
     * Sets the points. Throws error if invalid value.
     * @param {number} newpoints
     */
    this.setPoints = function(newpoints) {
        if (newpoints === NaN || newpoints < 1 || newpoints % 1 !== 0) {
            throw new RangeError('The points must be a whole number greater than 0!');
        }
        points = newpoints;
    };

    /**
     * Gets the texts.
     * @returns {string[]}
     */
    this.getTexts = function() {
        return texts;
    };

    /**
     * Sets the texts. Throws error if invalid value.
     * @param {string[]} newtexts
     */
    this.setTexts = function(newtexts) {
        if (!(newtexts instanceof Array) || newtexts.length < 1) {
            throw new RangeError('The texts must be an array containing at least one item!');
        }
        texts = newtexts;
    };

    this.setHour(hour);
    this.setMinute(minute);
    this.setPoints(points);
    this.setTexts(texts);
}

/**
 * Returns a new DankTime parsed from a literal.
 * @param {Object} literal
 * @returns {DankTime}
 */
DankTime.fromJson = function(literal) {
    return new DankTime(literal.hour, literal.minute, literal.texts, literal.points);
};

/**
 * Compares two dank times using their hour and minute. Used for sorting collections.
 * @param {DankTime} a
 * @param {DankTime} b
 * @returns {number}
 */
DankTime.compare = function(a, b) {
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
