'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api'); // Client library for Telegram API.
const Command = require('./command.js');

/**
 * Instantiates a new Telegram Client that communicates with the API via the 'node-telegram-bot-api' library.
 */
function TelegramClient() {

    /** All the available settings of the bot. */
    const commands = new Map();

    /** Access to the 'node-telegram-bot-api' library.  */
    let bot;

    /**
     * Initializes this TelegramClient, if it hasn't already.
     * @param {string} apiKey
     */
    this.init = function (apiKey) {
        if (bot) {
            throw Error('This client is already initialized!');
        }
        if (typeof apiKey !== 'string') {
            throw TypeError('The API key must be a string!');
        }
        bot = new TelegramBot(apiKey, { polling: true });
    };

    /**
     * Gets all registered commands.
     * @returns {Map<string,Command>}
     */
    this.getCommands = function () {
        return commands;
    };

    /**
     * Sets the action to do on ANY incoming text.
     * @param {function} _function The function to call.
     */
    this.setOnAnyText = function (_function) {
        if (!bot) {
            throw Error('This client is not yet initialized!');
        }
        bot.on('message', (msg, match) => _function(msg, match));
    };

    /**
     * Registers a new command, overriding any with the same name.
     * @param {Command} command
     */
    this.registerCommand = function (command) {
        if (!bot) {
            throw Error('This client is not yet initialized!');
        }
        if (!(command instanceof Command)) {
            throw TypeError('The command must be of type Command!');
        }
        commands.set(command.getName(), command);

        // Register the command with the bot accordingly.
        if (!command.getAdminOnly()) {
            bot.onText(command.getRegex(), (msg, match) => {
                this.sendMessage(msg.chat.id, command.getFunction()(msg, match));
            });
        } else {
            bot.onText(command.getRegex(), (msg, match) => {
                this.callFunctionIfUserIsAdmin(msg, match, command.getFunction());
            });
        }
    };

    /**
     * Sends a message to the specified chat.
     * @param {number} chatId The unique Telegram chat id.
     * @param {string} message In HTML format.
     */
    this.sendMessage = function (chatId, message) {
        if (!bot) {
            throw Error('This client is not yet initialized!');
        }
        bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    };

    /**
     * Calls the specified function, but only if the calling user is
     * an admin in his chat, or it is a private chat.
     * @param {any} msg The message object from the Telegram api.
     * @param {any} match The matched regex.
     * @param {function} _function The function to call. Should have parameters msg, match, chat.
     */
    this.callFunctionIfUserIsAdmin = function (msg, match, _function) {
        if (!bot) {
            throw Error('This client is not yet initialized!');
        }

        // Only groups have admins, so if this chat isn't a group, continue straight to callback.
        if (msg.chat.type === 'private') {
            this.sendMessage(msg.chat.id, _function(msg, match));
            return;
        }

        // Else if this chat is a group, then we must make sure the user is an admin.
        const promise = bot.getChatAdministrators(msg.chat.id);
        const _this = this;
        promise.then(admins => {

            // Check to ensure user is admin. If not, post message.
            for (const admin of admins) {
                if (admin.user.id === msg.from.id) {
                    this.sendMessage(msg.chat.id, _function(msg, match));
                    return;
                }
            }
            this.sendMessage(msg.chat.id, 'This option is only available to admins!');
        }).catch(reason => {
            console.error('Failed to retrieve admin list!\n' + reason);
            this.sendMessage(msg.chat.id, 'Failed to retrieve admin list! See server console.');
        });
    }
};

// Exports.
module.exports = new TelegramClient();  // Singleton