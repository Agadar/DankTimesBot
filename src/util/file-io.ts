import * as fs from "fs";
import { BasicChat } from "../chat/basic-chat";
import { Chat } from "../chat/chat";
import { Config } from "../config";
import { Release } from "../release";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import * as ts from "typescript";

// Constants.
const dataFolder = "./data";
const backupFile = dataFolder + "/backup.json";
const configFile = dataFolder + "/config.json";
// settings.json is deprecated, using config.json instead. Here for backwards compatibility.
const settingsFile = dataFolder + "/settings.json";
const releasesFile = "./releases.json";
const apiKeyEnvKey = "DANK_TIMES_BOT_API_KEY";
const jsonIndentation = 2;

export function saveConfigToFile(config: Config): void {
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }
  fs.writeFileSync(configFile, JSON.stringify(config, undefined, jsonIndentation));
}

/**
 * Parses the JSON data in the file to a Config object. If the file does not exist,
 * then a new one with default values is created.
 */
export function loadConfigFromFile(): Config {

  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }

  const config: Config = {
    apiKey: "",
    persistenceRate: 60,
    sendWhatsNewMsg: true,
    plugins: []
  };

  // If there is a config file, load its valid values into config obj.
  let configOrSettingsFile = configFile;
  let exists = fs.existsSync(configOrSettingsFile);
  if (!exists) {
    configOrSettingsFile = settingsFile;
    exists = fs.existsSync(configOrSettingsFile);
  }
  if (exists) {
    const configFromFile: Config = JSON.parse(fs.readFileSync(configOrSettingsFile, "utf8"));
    if (configFromFile.apiKey !== undefined) {
      config.apiKey = configFromFile.apiKey;
    }
    if (configFromFile.persistenceRate !== undefined) {
      config.persistenceRate = configFromFile.persistenceRate;
    }
    if (configFromFile.sendWhatsNewMsg !== undefined) {
      config.sendWhatsNewMsg = configFromFile.sendWhatsNewMsg;
    }
    if(configFromFile.plugins !== undefined) {
      config.plugins = configFromFile.plugins;
      }
  }

  // If there was an undefined/empty API key in the config file, try retrieve it from env.
  if (config.apiKey === null || config.apiKey.length < 1) {
    const apiKeyFromEnv = process.env[apiKeyEnvKey];
    if (apiKeyFromEnv) {
      config.apiKey = apiKeyFromEnv;
    }
    if (!config.apiKey) {
      console.error(`No Telegram API key was found, not in the config file nor in the` +
      ` environment variable '${apiKeyEnvKey}'! Exiting...`);
      fs.writeFileSync(configFile, JSON.stringify(config, undefined, jsonIndentation));
      process.exit(-1);
    }
  }

  // Always write the file back to correct any mistakes in it.
  fs.writeFileSync(configFile, JSON.stringify(config, undefined, jsonIndentation));
  return config;
}

/**
 * Parses the JSON data in the file to a Map of Chat objects.
 */
export function loadChatsFromFile(): Map<number, Chat> {

  // Create the data folder if it doesn't exist yet.I
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }
  const chats = new Map<number, Chat>();

  // If the data file exists, load and parse the data to an object.
  if (fs.existsSync(backupFile)) {
    (JSON.parse(fs.readFileSync(backupFile, "utf8")) as BasicChat[])
      .forEach((chat) => chats.set(chat.id, Chat.fromJSON(chat)));
  }
  return chats;
}

/**
 * Parses a Map of Chat objects to JSON and saves it to a file.
 */
export function saveChatsToFile(chats: Map<number, Chat>): void {
  // Create the data folder if it doesn't exist yet.
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }

  // Write to backup file.
  fs.writeFileSync(backupFile, JSON.stringify(chats, mapReplacer, jsonIndentation));
}

/**
 * Loads the releases from the Release.json file. If at all possible.
 * @returns {Release[]}
 */
export function loadReleaseLogFromFile(): Release[] {

  // If no releases file exists, just return an empty array.
  if (!fs.existsSync(releasesFile)) {
    return [];
  }

  const releases = JSON.parse(fs.readFileSync(releasesFile, "utf8"));
  for (let i = 0; i < releases.length; i++) {
    releases[i] = new Release(releases[i].version, releases[i].date, releases[i].changes);
  }
  return releases;
}

/**
 * Used by JSON.stringify(...) for parsing maps to arrays, because
 * it can't handle maps.
 */
function mapReplacer(key: any, value: any): any[] {
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
 * Discover, Compile and load external plugins
 * from the plugins/ directory.
 * 
 * Returns 0..n plugins.
 */
export function GetAvailablePlugins(_pluginsToActivate: string[]): AbstractPlugin[]
{
  // Directory in which to find plugins.
  const DIRECTORY: string = "plugins/";

  // Plugin directories
  let directories: string[] = (fs.readdirSync(DIRECTORY).filter(f => fs.statSync(DIRECTORY + "/" + f).isDirectory()));

  // Get active plugins
  let activePlugins: string[] = directories.filter(pluginDir => fs.existsSync(`${DIRECTORY}/${pluginDir}/plugin.ts`) && _pluginsToActivate.indexOf(pluginDir) > -1);
  // Compile
  // Get all directories with plugin.ts
  // Rewrite Directory -> Directory/plugin.ts & Compile
  (ts.createProgram(activePlugins
    .map(pluginDir => `${DIRECTORY}${pluginDir}/plugin.ts`), {})).emit();

  // Load & Return plugins.
  return activePlugins.map(plugin => {return new(require(`../../plugins/${plugin}/plugin.js`)).Plugin()});
}