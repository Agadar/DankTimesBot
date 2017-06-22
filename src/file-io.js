'use strict';

/**
 * Exposes file I/O related functions for DankTimesBot.
 */

// Imports.
const fs = require('fs'); // For working with files.

// Constants.
const DATA_FOLDER     = './data';
const BACKUP_PATH     = DATA_FOLDER + '/backup.json';
const SETTINGS_PATH   = DATA_FOLDER + '/settings.json';
const API_KEY_ENV     = 'DANK_TIMES_BOT_API_KEY';

// Exports.
module.exports.loadSettingsFromFile   = loadSettingsFromFile;
module.exports.loadChatsFromFile      = loadChatsFromFile;
module.exports.saveChatsToFile        = saveChatsToFile;

/**
 * Parses the JSON data in the file to a Settings object. If the file does not exist,
 * then a new one with default values is created.
 * It should have the following fields:
 * - apiKey: The Telegram API key;
 * - persistenceRate: The rate in minutes at which data should be persisted to the data file.
 * @return {Settings} The settings.
 */
function loadSettingsFromFile() {
  const settings = {apiKey: '', persistenceRate: 60}; // Default settings.

  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }

  // If there is a settings file, load its valid values into settings obj.
  if (fs.existsSync(SETTINGS_PATH)) {
    const settingsFromFile = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    for (const property in settingsFromFile) {
      if (settingsFromFile.hasOwnProperty(property) && settings.hasOwnProperty(property) && settingsFromFile[property]) {
        settings[property] = settingsFromFile[property];
      }
    }
  }

  // If there was an undefined/empty API key in the settings file, try retrieve it from env.
  if (!settings.apiKey) {
    settings.apiKey = process.env[API_KEY_ENV];
    if (!settings.apiKey) {
      console.error('No Telegram API key was found, not in the settings file nor in the environment variable \'' + API_KEY_ENV + '\'! Exiting...');
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, '\t'));
      process.exit(-1);
    }
  }

  // Always write the file back to correct any mistakes in it.
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, '\t'));
  return settings;
}

/**
 * Parses the JSON data in the file to a Map of Chat objects.
 * @return {Map} Map containing Chat objects.
 */
function loadChatsFromFile() {
  const chats = new Map();

  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }
  
  // If the data file exists, load and parse the data to an object.
  if (fs.existsSync(BACKUP_PATH)) {
    for (const chat of JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'))) {
      usersArrayToMap(chat);
      chats.set(chat.id, chat);

      if (!chat.lastTime.hour || !chat.lastTime.minute) {  // For backwards compatibility with v.1.0.0.
        chat.lastTime = { hour: -1, minute: -1 };
        for (let dankTime of chat.dankTimes) {
          dankTime.texts = [dankTime.shoutout];
          delete dankTime.shoutout;
        }
        for (let dankTime of chat.randomDankTimes) {
          dankTime.texts = [dankTime.shoutout];
          delete dankTime.shoutout;
        }
      }
    }
  }
  return chats;
}

/**
 * Parses a Map of Chat objects to JSON and saves it to a file.
 * @param {Map} chat Map containing Chat objects.
 */
function saveChatsToFile(chat) {
  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }

  // Write to backup file.
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(chat, mapReplacer, '\t'));
}

/**
 * Converts chat.users from Array to Map.
 * @param {Chat} chat 
 */
function usersArrayToMap(chat) {
  const users = new Map();

  // User array to map.
  for (const user of chat.users) {
    users.set(user.id, user);
  }

  // Override fields and add to map.
  chat.users = users;
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