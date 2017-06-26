'use strict';

/**
 * Defines a new command for the Telegram bot.
 * @param {string} name The name of the command, e.g. 'start'.
 * @param {string} description Brief description of the command.
 * @param {function} _function The function which this command calls. Expected to take parameters 'msg' and 'match' and return a string.
 * @param {boolean} adminOnly Whether only admins can execute this command.
 * @param {boolean} requiresConfirmation Whether this command requires explicit confirmation.
 */
function Command(name, description, _function, adminOnly = false, requiresConfirmation = false) {

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
    if (typeof adminOnly !== 'boolean') {
        throw TypeError('The admin-only setting must be a boolean!');
    }
    if (typeof requiresConfirmation !== 'boolean') {
        throw TypeError('The requires-confirmation setting must be a boolean!');
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

    /**
     * Gets whether only admins can execute this command.
     * @returns {boolean}
     */
    this.getAdminOnly = function () {
        return adminOnly;
    };

    /**
     * Gets whether this command requires explicit confirmation.
     * @returns {boolean}
     */
    this.getRequiresConfirmation = function () {
        return requiresConfirmation;
    }
};

// Exports.
module.exports = Command;