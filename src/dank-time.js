'use strict';

/**
 * Creates a new dank time object.
 * @param {number} hour The hour at which points can be scored.
 * @param {number} minute The minute at which points can be scored.
 * @param {string[]} texts The texts to shout at the hour:minute to score points.
 * @param {number} points The amount of points to reward or confiscate.
 */
function DankTime(hour, minute, texts, points = 1) {

    /**
     * Sets the hour.
     * @param {number} newhour
     */
    this.setHour = function(newhour) {
        if (typeof newhour !== 'number' || newhour < 0 || newhour > 23 || newhour % 1 !== 0) {
            throw TypeError('The hour must be a whole number between 0 and 23!');
        }
        hour = newhour;
    };

    /**
     * Sets the minute.
     * @param {number} newminute
     */
    this.setMinute = function(newminute) {
        if (typeof newminute !== 'number' || newminute < 0 || newminute > 59 || newminute % 1 !== 0) {
            throw TypeError('The minute must be a whole number between 0 and 59!');
        }
        minute = newminute;
    };

    /**
     * Sets the points.
     * @param {number} newpoints
     */
    this.setPoints = function(newpoints) {
        if (typeof newpoints !== 'number' || newpoints < 1 || newpoints % 1 !== 0) {
            throw TypeError('The points must be a whole number greater than 0!');
        }
        points = newpoints;
    };

    /**
     * Sets the texts.
     * @param {string[]} newtexts
     */
    this.setTexts = function(newtexts) {
        if (!(newtexts instanceof Array) || newtexts.length < 1) {
            throw TypeError('The texts must be a string array containing at least one item!');
        }
        newtexts.forEach(entry => {
            if (typeof entry !== 'string') {
                throw TypeError('The texts must contain only strings!');
            }
        });
        texts = newtexts;
    };

    // 'Constructor'
    this.setHour(hour);
    this.setMinute(minute);
    this.setPoints(points);
    this.setTexts(texts);

    /**
     * Gets the texts.
     * @returns {string[]}
     */
    this.getTexts = function() {
        return texts;
    };

    /**
     * Gets the points.
     * @returns {number}
     */
    this.getPoints = function() {
        return points;
    };


    /**
     * Gets the minute.
     * @returns {number}
     */
    this.getMinute = function() {
        return minute;
    };

    /**
     * Gets the hour.
     * @returns {number}
     */
    this.getHour = function() {
        return hour;
    };
}

/**
 * Returns a new DankTime parsed from a JSON string.
 * @param {string} json
 * @returns {DankTime}
 */
DankTime.fromJson = function(json) {
    const literal = JSON.parse(json);
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

// Exports.
module.exports = DankTime;