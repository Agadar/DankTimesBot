'use strict';

/**
 * Imports
 */
const Chat = require('./chat.js');
const DankTime = require('./dank-time.js');

/**
 * Keeps track of all the chats.
 */
class ChatRegistry {

  /**
   * Instantiates a new chat registry.
   * @param {Map<number,Chat>} chats The initial chats.
   */
  constructor(chats = new Map()) {
    this.setChats(chats);
  }

  /**
   * Sets the chats.
   * @param {Map<number,Chat>} newchats
   */
  setChats(newchats) {
    if (!(newchats instanceof Map)) {
      throw TypeError('The chats should be a map!');
    }
    this._chats = newchats;
  };

  /**
   * Gets the map containing all chats.
   * @returns {Map<number,Chat>}
   */
  getChats() {
    return this._chats;
  };

  /**
   * Gets the chat with the supplied id, otherwise creates and returns a new one.
   * @param {number} id The chat's unique Telegram id.
   * @returns {Chat} The (possibly new) chat.
   */
  getOrCreateChat(id) {
    if (this._chats.has(id)) {
      return this._chats.get(id);
    }
    const chat = new Chat(id);
    chat.addDankTime(new DankTime(0, 0, ['0000'], 5));
    chat.addDankTime(new DankTime(4, 20, ['420'], 15));
    chat.addDankTime(new DankTime(11, 11, ['1111'], 5));
    chat.addDankTime(new DankTime(12, 34, ['1234'], 5));
    chat.addDankTime(new DankTime(13, 37, ['1337'], 10));
    chat.addDankTime(new DankTime(16, 20, ['420'], 10));
    chat.addDankTime(new DankTime(22, 22, ['2222'], 5));
    this._chats.set(id, chat);
    return chat;
  };
};

// Exports.
module.exports = ChatRegistry;
