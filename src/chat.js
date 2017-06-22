'use strict';

// Imports.
const DankTime  = require('./dank-time.js');
const User      = require('./user.js');

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
 */
function Chat(id, timezone = 'Europe/Amsterdam', running = false, numberOfRandomTimes = 1, pointsPerRandomTime = 10,
    lastHour = 0, lastMinute = 0, users = new Map(), dankTimes = [], randomDankTimes = []) {



    // TODO: validate parameters



    /**
     * Adds a new normal dank time to this chat, replacing any dank time that has
     * the same hour and minute.
     * @param {DankTime} dankTime
     */
    this.addDankTime = function(dankTime) {
        const existing = getDankTime(dankTime.getHour(), dankTime.getMinute());
        if (existing) {
            dankTimes.splice(dankTimes.indexOf(existing), 1);
        }
        dankTimes.push(dankTime);
    }

    /**
     * Gets the normal dank time that has the specified hour and minute.
     * @param {number} hour 
     * @param {number} minute 
     * @returns {DankTime} or undefined if none has the specified hour and minute.
     */
    function getDankTime(hour, minute) {
        for (let dankTime of dankTimes) {
            if (dankTime.getHour() === hour && dankTime.getMinute() === minute) {
                return dankTime;
            }
        }
    }

    /**
     * Gets both normal and random dank times that have the specified text.
     * @param {string} text 
     * @returns {DankTime[]}
     */
    function getDankTimesByText(text) {
        const found = [];
        for (let dankTime of dankTimes.concat(randomDankTimes)) {
            if (dankTime.getTexts().indexOf(text) > -1) {
                found.push(dankTime);
            }
        }
        return found;
    }
}

// Exports.
module.exports = Chat;