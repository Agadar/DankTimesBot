'use strict';

/**
 * Exposes file I/O related functions for DankTimesBot.
 */

// Class Defines

/**
 * Releaselog
 */
var Releaselog = class Releaselog {
  constructor() {
    this.Releases = [];
  }
}

/**
 * Individual Release
 */
var Release = class Release {
  constructor() {
    this.Tag      = "";
    this.Date     = "";
    this.Changes  = [];
  }
}

// Imports.
const fs = require('fs'); // For working with files.
const Chat = require('./chat.js');

// Constants.
const DATA_FOLDER = './data';
const BACKUP_PATH = DATA_FOLDER + '/backup.json';
const SETTINGS_PATH = DATA_FOLDER + '/settings.json';
const API_KEY_ENV = 'DANK_TIMES_BOT_API_KEY';

// Exports.
module.exports.loadSettingsFromFile   = loadSettingsFromFile;
module.exports.loadChatsFromFile      = loadChatsFromFile;
module.exports.saveChatsToFile        = saveChatsToFile;
module.exports.loadReleaseLogFromFile = loadReleaseLogFromFile;
module.exports.Releaselog             = Releaselog
module.exports.Release                = Release;

/**
 * Parses the JSON data in the file to a Settings object. If the file does not exist,
 * then a new one with default values is created.
 * It should have the following fields:
 * - apiKey: The Telegram API key;
 * - persistenceRate: The rate in minutes at which data should be persisted to the data file.
 * @return {Settings} The settings.
 */
function loadSettingsFromFile() {
  const settings = { apiKey: '', persistenceRate: 60 }; // Default settings.

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

  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }
  const chats = new Map();

  // If the data file exists, load and parse the data to an object.
  if (fs.existsSync(BACKUP_PATH)) {
    JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8')).forEach(chat => chats.set(chat.id, Chat.fromJSON(chat)));
  }
  return chats;
}

/**
 * Parses a Map of Chat objects to JSON and saves it to a file.
 * @param {Map<number,Chat>} chats Map containing Chat objects.
 */
function saveChatsToFile(chats) {
  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }

  // Write to backup file.
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(chats, mapReplacer, 1));
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

/**
 * Loads the release log from the Release.json file. If at all possible.
 * @return {Releaselog} Releaselog.
 */
function loadReleaseLogFromFile() {
  var Releaselog = new this.Releaselog();

  if(fs.existsSync('Release.json')) {
    return Object.assign(Releaselog, JSON.parse(fs.readFileSync('Release.json')));
  }
}