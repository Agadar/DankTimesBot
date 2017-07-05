'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api'); // Client library for Telegram API.
const Command = require('./command.js');

/**
 * The Telegram Client that communicates with the API via the 'node-telegram-bot-api' library.
 */
class TelegramClient {

    /**
     * Instantiates a new client.
     * @param {string} apiKey The Telegram API key.
     */
    constructor(apiKey) {
        if (typeof apiKey !== 'string') {
            throw TypeError('The API key must be a string!');
        }
        this._commands = new Map(); // All the available settings of the bot.
        this._bot = new TelegramBot(apiKey, { polling: true }); // Access to the 'node-telegram-bot-api' library.
    }

    /**
     * Gets all registered commands.
     * @returns {Map<string,Command>}
     */
    getCommands() {
        return this._commands;
    };

    /**
     * Sets the action to do on ANY incoming text.
     * @param {function} _function The function to call.
     */
    setOnAnyText(_function) {
        this._bot.on('message', (msg, match) => { 
            const output = _function(msg, match);
            if (output) {
                this.sendMessage(msg.chat.id, output);
            }
        });
    };

    /**
     * Registers a new command, overriding any with the same name.
     * @param {Command} command
     */
    registerCommand(command) {
        if (!(command instanceof Command)) {
            throw TypeError('The command must be of type Command!');
        }
        this._commands.set(command.getName(), command);

        // Register the command with the bot accordingly.
        if (!command.getAdminOnly()) {
            this._bot.onText(command.getRegex(), (msg, match) => {
                this.sendMessage(msg.chat.id, command.getFunction().call(command.getObject(), msg, match));
            });
        } else {
            this._bot.onText(command.getRegex(), (msg, match) => {
                this._callFunctionIfUserIsAdmin(msg, match, command.getObject(), command.getFunction());
            });
        }
    };

    /**
     * Sends a message to the specified chat.
     * @param {number} chatId The unique Telegram chat id.
     * @param {string} message In HTML format.
     */
    sendMessage(chatId, message) {
        this._bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    };

    /**
     * Calls the specified function, but only if the calling user is
     * an admin in his chat, or it is a private chat.
     * @param {any} msg The message object from the Telegram api.
     * @param {any} match The matched regex.
     * @param {Object} object The object to call the function on.
     * @param {function} _function The function to call. Should have parameters msg, match, chat.
     */
    _callFunctionIfUserIsAdmin(msg, match, object, _function) {

        // Only groups have admins, so if this chat isn't a group, continue straight to callback.
        if (msg.chat.type === 'private') {
            this.sendMessage(msg.chat.id, _function.call(object, msg, match));
            return;
        }

        // Else if this chat is a group, then we must make sure the user is an admin.
        this._bot.getChatAdministrators(msg.chat.id).then(admins => {

            // Check to ensure user is admin. If not, post message.
            for (const admin of admins) {
                if (admin.user.id === msg.from.id) {
                    this.sendMessage(msg.chat.id, _function.call(object, msg, match));
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
module.exports = TelegramClient;