/**
 * Exposes file I/O related functions for DankTimesBot.
 */

import * as fs from 'fs';
import { Chat, ChatLiteral } from '../chat/chat';
import { Release } from '../release';

// Constants.
const DATA_FOLDER = './data';
const BACKUP_PATH = DATA_FOLDER + '/backup.json';
const SETTINGS_PATH = DATA_FOLDER + '/settings.json';
const RELEASE_LOG_PATH = DATA_FOLDER + '/releases.json';
const API_KEY_ENV = 'DANK_TIMES_BOT_API_KEY';

/**
 * Parses the JSON data in the file to a Settings object. If the file does not exist,
 * then a new one with default values is created.
 */
export function loadSettingsFromFile(): { apiKey: string, persistenceRate: number } {
  const settings = { apiKey: '', persistenceRate: 60 }; // Default settings.

  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }

  // If there is a settings file, load its valid values into settings obj.
  if (fs.existsSync(SETTINGS_PATH)) {
    const settingsFromFile = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    if (settingsFromFile.apiKey) {
      settings.apiKey = settingsFromFile.apiKey;
    }
    if (settingsFromFile.persistenceRate) {
      settings.persistenceRate = settingsFromFile.persistenceRate;
    }
  }

  // If there was an undefined/empty API key in the settings file, try retrieve it from env.
  if (!settings.apiKey) {
    const apiKeyFromEnv = process.env[API_KEY_ENV];
    if (apiKeyFromEnv) {
      settings.apiKey = apiKeyFromEnv;
    }
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
 */
export function loadChatsFromFile(): Map<number, Chat> {

  // Create the data folder if it doesn't exist yet.I
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }
  const chats = new Map<number, Chat>();

  // If the data file exists, load and parse the data to an object.
  if (fs.existsSync(BACKUP_PATH)) {
    (JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8')) as Array<ChatLiteral>).forEach(chat => chats.set(chat.id, Chat.fromJSON(chat)));
  }
  return chats;
}

/**
 * Parses a Map of Chat objects to JSON and saves it to a file.
 */
export function saveChatsToFile(chats: Map<number, Chat>): void {
  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
  }

  // Write to backup file.
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(chats, mapReplacer, 1));
}

/**
 * Loads the releases from the Release.json file. If at all possible.
 * @returns {Release[]}
 */
export function loadReleaseLogFromFile(): Release[] {

  // If no releases file exists, just return an empty array.
  if (!fs.existsSync(RELEASE_LOG_PATH)) {
    return [];
  }

  const releases = JSON.parse(fs.readFileSync(RELEASE_LOG_PATH, 'utf8'));
  for (let i = 0; i < releases.length; i++) {
    releases[i] = new Release(releases[i].version, releases[i].date, releases[i].changes);
  }
  return releases;
}

/**
 * Used by JSON.stringify(...) for parsing maps to arrays, because
 * it can't handle maps.
 */
function mapReplacer(key: any, value: any): Array<any> {
  if (value instanceof Map) {
    const array = [];
    for (const entry of value) {
      array.push(entry[1]);
    }
    return array;
  }
  return value;
}
