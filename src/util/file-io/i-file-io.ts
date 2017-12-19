import { BasicChat } from "../../chat/basic-chat";
import { Chat } from "../../chat/chat";
import { Config } from "../../misc/config";
import { Release } from "../../misc/release";

export interface IFileIO {

  saveConfigToFile(config: Config): void;

  /**
   * Parses the JSON data in the file to a Config object. If the file does not exist,
   * then a new one with default values is created.
   */
  loadConfigFromFile(): Config;

  loadChatsFromFile(): BasicChat[];

  /**
   * Parses a Map of Chat objects to JSON and saves it to a file.
   */
  saveChatsToFile(chats: Map<number, Chat>): void;

  /**
   * Loads the releases from the Release.json file. If at all possible.
   * @returns {Release[]}
   */
  loadReleaseLogFromFile(): Release[];
}
