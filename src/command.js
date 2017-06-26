'use strict';

/**
 * Defines a new command for the Telegram bot.
 * @param {string} name The name of the command, e.g. 'start'.
 * @param {string} description Brief description of the command.
 * @param {function} _function The function which this command calls.
 */
function Command(name, description, _function) {

    // 'Constructor'
    if (typeof name !== 'string') {
        throw TypeError('The name must be a string!');
    }
    if (typeof description !== 'string') {
        throw TypeError('The description must be a string!');
    }
    if (typeof _function !== 'function') {
        throw TypeError('The function must be a function!');
    }

    /**
     * Gets this command's regex, which is based on its name.
     * @returns {RegExp}
     */
    this.getRegex = function () {
        return RegExp('^\\/' + name + '(?:\\@DankTimesBot)?(?:\\s(?:[\\w\\d]+)+)*$', 'i');
    };

    /**
     * Gets the name of the command, e.g. 'start'.
     * @returns {string}
     */
    this.getName = function () {
        return name;
    };

    /**
     * Gets the brief description of the command.
     * @returns {string}
     */
    this.getDescription = function () {
        return description;
    };

    /**
     * Gets the function which this command calls.
     * @returns {function}
     */
    this.getFunction = function () {
        return _function;
    };
};

// Exports.
module.exports = Command;