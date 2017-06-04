'use strict';

/**
 * Exposes file i/o related functions for DankTimesBot.
 */

// Imports.
const fs = require('fs'); // For working with files.

// Exports.
module.exports.loadSettingsFromFile = loadSettingsFromFile;
module.exports.loadChatsFromFile = loadChatsFromFile;
module.exports.saveChatsToFile = saveChatsToFile;

/**
 * Parses the JSON data in the file to a Settings object. If the file does not exist,
 * then a new one with default values is created.
 * It should have the following fields:
 * - apiKey: The Telegram API key;
 * - persistence_rate: The rate in minutes at which data should be persisted to the data file;
 * - dataFilePath: The path to the data file.
 * @param {string} filePath Path to the settings file.
 * @return {object} {apiKey: string, persistence_rate: number, dataFilePath: string}
 */
function loadSettingsFromFile(filePath) {
  if (fs.existsSync(filePath)) {
    const settings = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Make sure the object has all the required properties.
    let saveAnew = false;
    if (!settings.hasOwnProperty('apiKey')) {
      settings.apiKey = '';
      saveAnew = true;
    }
    if (!settings.hasOwnProperty('persistence_rate') || settings.persistence_rate === NaN) {
      settings.persistence_rate = 60;
      saveAnew = true;
    }
    if (!settings.hasOwnProperty('dataFilePath')) {
      settings.dataFilePath = './dank-times-bot.data';
      saveAnew = true;
    }

    // If required, save anew the settings to the file.
    if (saveAnew) {
      fs.writeFileSync(filePath, JSON.stringify(settings, null, '\t'));
    }
    return settings;
  } else {
    const settings = {apiKey: '', persistence_rate: 60, dataFilePath: './dank-times-bot.data'};
    fs.writeFileSync(filePath, JSON.stringify(settings, null, '\t'));
    return settings;
  }
}

/**
 * Parses the JSON data in the file to a Map of Chat objects.
 * @param {string} filePath Path to the data file.
 * @return {Map} Map containing Chat objects.
 */
function loadChatsFromFile(filePath) {
  const chats = new Map();
  
  // If the data file exists, load and parse the data to an object.
  if (fs.existsSync(filePath)) {
    const chatsRaw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // We want to parse the arrays to proper maps, so let's do that.
    for (const chat of chatsRaw) {
      const users = new Map();
      const dankTimes = new Map();

      // User array to map.
      for (const user of chat.users) {
        users.set(user.id, user);
      }

      // DankTimes array to map.
      for (const dankTime of chat.dankTimes) {
        dankTimes.set(dankTime.shoutout, dankTime);
      }

      // Override fields and add to map.
      chat.users = users;
      chat.dankTimes = dankTimes;
      chats.set(chat.id, chat);
    }
  }
  return chats;
}

/**
 * Parses a Map of Chat objects to JSON and saves it to a file.
 * @param {string} filePath Path to the data file.
 * @param {Map} chat Map containing Chat objects.
 */
function saveChatsToFile(filePath, chat) {
  fs.writeFileSync(filePath, JSON.stringify(chat, mapReplacer, '\t'));
}

/**
 * Used by JSON.stringify(...) for parsing maps to arrays, because
 * it can't handle maps.
 * @param {any} key The key of the map field.
 * @param {any} value The map to be converted to an array.
 * @return {any[]} The array representation of the map.
 */
function mapReplacer(key, value) {
  if (value instanceof Map) {
    const array = [];
    for (const entry of value) {
      array.push(entry[1]);
    }
    return array;
  }
  return value;
}
