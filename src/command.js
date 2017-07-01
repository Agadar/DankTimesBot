'use strict';

/**
 * Represents a command that can be executed by a Telegram bot.
 */
class Command {

    /**
     * Defines a new command for the Telegram bot.
     * @param {string} name The name of the command, e.g. 'start'.
     * @param {string} description Brief description of the command.
     * @param {object} object The object to call the function on.
     * @param {function} _function The function which this command calls. Expected to take parameters 'msg' and 'match' and return a string.
     * @param {boolean} adminOnly Whether only admins can execute this command.
     * @param {boolean} requiresConfirmation Whether this command requires explicit confirmation.
     */
    constructor(name, description, object, _function, adminOnly = false, requiresConfirmation = false) {
        if (typeof name !== 'string') {
            throw TypeError('The name must be a string!');
        }
        if (typeof description !== 'string') {
            throw TypeError('The description must be a string!');
        }
        if (typeof object !== 'object') {
            throw TypeError('The object must be an object!');
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
        this._name = name;
        this._description = description;
        this._object = object;
        this._function = _function;
        this._adminOnly = adminOnly;
        this._requiresConfirmation = requiresConfirmation;
    }

    /**
     * Gets this command's regex, which is based on its name.
     * @returns {RegExp}
     */
    getRegex() {
        return RegExp('^\\/' + this._name + '(?:\\@DankTimesBot)?(?:\\s(?:[\\w\\d]+)+)*$', 'i');
    };

    /**
     * Gets the name of the command, e.g. 'start'.
     * @returns {string}
     */
    getName() {
        return this._name;
    };

    /**
     * Gets the brief description of the command.
     * @returns {string}
     */
    getDescription() {
        return this._description;
    };

    /**
     * Gets the object on which the command is called.
     * @returns {Object}
     */
    getObject() {
        return this._object;
    };

    /**
     * Gets the function which this command calls.
     * @returns {function}
     */
    getFunction() {
        return this._function;
    };

    /**
     * Gets whether only admins can execute this command.
     * @returns {boolean}
     */
    getAdminOnly() {
        return this._adminOnly;
    };

    /**
     * Gets whether this command requires explicit confirmation.
     * @returns {boolean}
     */
    getRequiresConfirmation() {
        return this._requiresConfirmation;
    }
};

// Exports.
module.exports = Command;