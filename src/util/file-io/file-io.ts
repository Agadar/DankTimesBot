import * as fs from "fs";
import ts from "typescript";
import { Config } from "../../misc/config";
import { Release } from "../../misc/release";
import { AbstractPlugin } from "../../plugin-host/plugin/plugin";

export class FileIO {

  private readonly dataFolder = "./data";
  private readonly configFile = "config.json";
  private readonly releasesFile = "releases.json";

  private readonly apiKeyEnvKey = "DANK_TIMES_BOT_API_KEY";
  private readonly jsonIndentation = 2;

  public saveConfigToFile(config: Config): void {
    if (!fs.existsSync(this.dataFolder)) {
      fs.mkdirSync(this.dataFolder);
    }
    const configPath = `${this.dataFolder}/${this.configFile}`;
    fs.writeFileSync(configPath, JSON.stringify(config, undefined, this.jsonIndentation));
  }

  /**
   * Parses the JSON data in the file to a Config object. If the file does not exist,
   * then a new one with default values is created.
   */
  public loadConfigFromFile(): Config {

    // Create the data folder if it doesn't exist yet.
    if (!fs.existsSync(this.dataFolder)) {
      fs.mkdirSync(this.dataFolder);
    }

    const config: Config = {
      apiKey: "",
      persistenceRate: 60,
      plugins: [],
      sendWhatsNewMsg: true,
    };

    // If there is a config file, load its valid values into config obj.
    const configFilePath = `${this.dataFolder}/${this.configFile}`;
    if (fs.existsSync(configFilePath)) {
      const configFromFile: Config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
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
        fs.writeFileSync(configFilePath, JSON.stringify(config, undefined, this.jsonIndentation));
        process.exit(-1);
      }
    }

    // Always write the file back to correct any mistakes in it.
    fs.writeFileSync(configFilePath, JSON.stringify(config, undefined, this.jsonIndentation));
    return config;
  }

  /**
   * Loads data from a file in the data folder. Data is expected
   * to be a simple struct or array/map thereof, as a simple JSON parse is used.
   * @param fileName Name of the file in the data folder.
   * @returns The loaded data, or null if no data found.
   */
  public loadDataFromFile<T>(fileName: string): T | null {
    if (!fs.existsSync(this.dataFolder)) {
      fs.mkdirSync(this.dataFolder);
    }
    const filePath = `${this.dataFolder}/${fileName}`;
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    return null;
  }

  /**
   * Loads data from a file in the data folder. Same functionality as
   * loadDataFromFile but allows supplying a converter to convert the
   * parsed data to a more complex type.
   * @param fileName Name of the file in the data folder.
   * @param converter Converter for raw structs to complex types.
   * @returns The loaded data, or null if no data found.
   */
  public loadDataFromFileWithConverter<O, T>(fileName: string, converter: (parsed: O) => T): T | null {
    const dataFromFile = this.loadDataFromFile<O>(fileName);
    if (dataFromFile) {
      return converter(dataFromFile);
    }
    return null;
  }

  /**
   * Saves data to a file in the data folder. Data is expected to be a simple
   * struct (or array/map thereof) or have a public toJSON() function which will be used for stringifying.
   * @param fileName Name of the file in the data folder.
   * @param data The data to save to file.
   */
  public saveDataToFile<T>(fileName: string, data: T): void {
    if (!fs.existsSync(this.dataFolder)) {
      fs.mkdirSync(this.dataFolder);
    }
    const filePath = `${this.dataFolder}/${fileName}`;
    fs.writeFileSync(filePath, JSON.stringify(data, this.mapReplacer, this.jsonIndentation));
  }

  /**
   * Loads the releases from the Release.json file. If at all possible.
   * @returns {Release[]}
   */
  public loadReleaseLogFromFile(): Release[] {
    const releasePath = `${this.dataFolder}/${this.releasesFile}`;

    if (!fs.existsSync(releasePath)) {
      return [];
    }
    const releases = JSON.parse(fs.readFileSync(releasePath, "utf8"));

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
  public GetAvailablePlugins(pluginsToActivate: string[]): AbstractPlugin[] {
    // Directory in which to find plugins.
    const DIRECTORY: string = "plugins/";

    // Plugin directories
    const directories: string[] = (fs.readdirSync(DIRECTORY)
      .filter((f: any) => fs.statSync(DIRECTORY + "/" + f).isDirectory()));

    // Get active plugins
    const activePlugins: string[] = directories
      .filter((pluginDir) => fs.existsSync(`${DIRECTORY}/${pluginDir}/plugin.ts`)
        && pluginsToActivate.indexOf(pluginDir) > -1);

    // Compile
    // Get all directories with plugin.ts
    // Rewrite Directory -> Directory/plugin.ts & Compile
    (ts.createProgram(activePlugins
      .map((pluginDir) => `${DIRECTORY}${pluginDir}/plugin.ts`), {})).emit();

    // Load & Return plugins.
    const plugins = activePlugins
      .map((plugin) => ([plugin, ((() => {
        try {
          return new (require(`../../../plugins/${plugin}/plugin.js`)).Plugin();
        } catch { return null; }
      }))()]))
      .filter((unfiltered) => unfiltered[1])
      .map((pluginMap) => {
        pluginMap[1].pID = () => pluginMap[0];
        return pluginMap[1];
      }); /* So Sorry */

    // Print plugins to console
    if (plugins.length === 0) {
      console.info("No plugins loaded!");
    } else {
      console.info("Loaded the following plugins:");
      plugins.forEach((plugin) => console.info(`- ${plugin.name} ${plugin.version}`));
    }

    return plugins;
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
