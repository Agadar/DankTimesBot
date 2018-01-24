import { BasicChat } from "../../chat/basic-chat";
import { Chat } from "../../chat/chat";
import { Config } from "../../misc/config";
import { Release } from "../../misc/release";
import { IFileIO } from "./i-file-io";
import { AbstractPlugin } from "../../plugin-host/plugin/plugin";
import * as ts from "typescript";

export class FileIO implements IFileIO {

  private readonly dataFolder = "./data";
  private readonly backupFile = this.dataFolder + "/backup.json";
  private readonly configFile = this.dataFolder + "/config.json";
  // settings.json is deprecated, using config.json instead. Here for backwards compatibility.
  private readonly settingsFile = this.dataFolder + "/settings.json";
  private readonly releasesFile = "./releases.json";
  private readonly apiKeyEnvKey = "DANK_TIMES_BOT_API_KEY";
  private readonly jsonIndentation = 2;

  constructor(private readonly fs: any) { }

  public saveConfigToFile(config: Config): void {
    if (!this.fs.existsSync(this.dataFolder)) {
      this.fs.mkdirSync(this.dataFolder);
    }
    this.fs.writeFileSync(this.configFile, JSON.stringify(config, undefined, this.jsonIndentation));
  }

  /**
   * Parses the JSON data in the file to a Config object. If the file does not exist,
   * then a new one with default values is created.
   */
  public loadConfigFromFile(): Config {

    // Create the data folder if it doesn't exist yet.
    if (!this.fs.existsSync(this.dataFolder)) {
      this.fs.mkdirSync(this.dataFolder);
    }

    const config: Config = {
      apiKey: "",
      persistenceRate: 60,
      sendWhatsNewMsg: true,
      plugins: []
    };

    // If there is a config file, load its valid values into config obj.
    let configOrSettingsFile = this.configFile;
    let exists = this.fs.existsSync(configOrSettingsFile);
    if (!exists) {
      configOrSettingsFile = this.settingsFile;
      exists = this.fs.existsSync(configOrSettingsFile);
    }
    if (exists) {
      const configFromFile: Config = JSON.parse(this.fs.readFileSync(configOrSettingsFile, "utf8"));
      if (configFromFile.apiKey !== undefined) {
        config.apiKey = configFromFile.apiKey;
      }
      if (configFromFile.persistenceRate !== undefined) {
        config.persistenceRate = configFromFile.persistenceRate;
      }
      if (configFromFile.sendWhatsNewMsg !== undefined) {
        config.sendWhatsNewMsg = configFromFile.sendWhatsNewMsg;
      }
      if (configFromFile.plugins !== undefined) {
        config.plugins = configFromFile.plugins;
      }
    }

    // If there was an undefined/empty API key in the config file, try retrieve it from env.
    if (config.apiKey === null || config.apiKey.length < 1) {
      const apiKeyFromEnv = process.env[this.apiKeyEnvKey];
      if (apiKeyFromEnv) {
        config.apiKey = apiKeyFromEnv;
      }
      if (!config.apiKey) {
        console.error(`No Telegram API key was found, not in the config file nor in the` +
          ` environment variable '${this.apiKeyEnvKey}'! Exiting...`);
        this.fs.writeFileSync(this.configFile, JSON.stringify(config, undefined, this.jsonIndentation));
        process.exit(-1);
      }
    }

    this.
      // Always write the file back to correct any mistakes in it.
      fs.writeFileSync(this.configFile, JSON.stringify(config, undefined, this.jsonIndentation));
    return config;
  }

  public loadChatsFromFile(): BasicChat[] {

    // Create the data folder if it doesn't exist yet.I
    if (!this.fs.existsSync(this.dataFolder)) {
      this.fs.mkdirSync(this.dataFolder);
    }

    if (this.fs.existsSync(this.backupFile)) {
      return JSON.parse(this.fs.readFileSync(this.backupFile, "utf8"));
    }
    return [];
  }

  /**
   * Parses a Map of Chat objects to JSON and saves it to a file.
   */
  public saveChatsToFile(chats: Map<number, Chat>): void {
    // Create the data folder if it doesn't exist yet.
    if (!this.fs.existsSync(this.dataFolder)) {
      this.fs.mkdirSync(this.dataFolder);
    }

    // Write to backup file.
    this.fs.writeFileSync(this.backupFile, JSON.stringify(chats, this.mapReplacer, this.jsonIndentation));
  }

  /**
   * Loads the releases from the Release.json file. If at all possible.
   * @returns {Release[]}
   */
  public loadReleaseLogFromFile(): Release[] {

    // If no releases file exists, just return an empty array.
    if (!this.fs.existsSync(this.releasesFile)) {
      return [];
    }

    const releases = JSON.parse(this.fs.readFileSync(this.releasesFile, "utf8"));
    for (let i = 0; i < releases.length; i++) {
      releases[i] = new Release(releases[i].version, releases[i].date, releases[i].changes);
    }
    return releases;
  }


/**
 * Discover, Compile and load external plugins
 * from the plugins/ directory.
 * 
 * Returns 0..n plugins.
 */
   public GetAvailablePlugins(_pluginsToActivate: string[]): AbstractPlugin[]
    {
  // Directory in which to find plugins.
  const DIRECTORY: string = "plugins/";

  // Plugin directories
  let directories: string[] = (this.fs.readdirSync(DIRECTORY).filter((f: any) => this.fs.statSync(DIRECTORY + "/" + f).isDirectory()));

  // Get active plugins
  let activePlugins: string[] = directories.filter(pluginDir => this.fs.existsSync(`${DIRECTORY}/${pluginDir}/plugin.ts`) && _pluginsToActivate.indexOf(pluginDir) > -1);
  // Compile
  // Get all directories with plugin.ts
  // Rewrite Directory -> Directory/plugin.ts & Compile
  (ts.createProgram(activePlugins
    .map(pluginDir => `${DIRECTORY}${pluginDir}/plugin.ts`), {})).emit();

  // Load & Return plugins.
  return activePlugins
  .map(plugin => {return ([plugin, new(require(`../../../plugins/${plugin}/plugin.js`)).Plugin()])})
  .map(pluginMap =>  {
    pluginMap[1].PID = () => pluginMap[0];
    return pluginMap[1];
  });
}

  /**
   * Used by JSON.stringify(...) for parsing maps to arrays, because
   * it can't handle maps.
   */
  private mapReplacer(key: any, value: any): any[] {
    if (value instanceof Map) {
      const array = [];
      for (const entry of value) {
        array.push(entry[1]);
      }
      return array;
    }
    return value;
  }
}
