import { Release } from "../../misc/release";

/** Holds functions that take a 'msg' and a 'match' parameter, and return string messages. */
export interface IDankTimesBotCommands {

  /**
   * Starts the specified chat so that it records dank time texts.
   * Only prints a warning if the chat is already running.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  startChat(msg: any, match: any): string;

  /**
   * Stops the specified chat so that it stops recording dank time texts.
   * Only prints a warning if the chat isn't already stopped.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  stopChat(msg: any, match: any): string;

  /**
   * Resets the scores of the specified chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  resetChat(msg: any, match: any): string;

  /**
   * Prints the current settings values of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  settings(msg: any, match: any): string;

  /**
   * Prints the current settings descriptions of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  settingshelp(msg: any, match: any): string;

  /**
   * Sets a setting of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  set(msg: any, match: any): string;

  /**
   * Prints the NORMAL dank times of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  dankTimes(msg: any, match: any): string;

  /**
   * Prints the leaderboard of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  leaderBoard(msg: any, match: any): string;

  /**
   * Prints the available commands to the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  help(msg: any, match: any): string;

  /**
   * Adds a new dank time to the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  addTime(msg: any, match: any): string;

  /**
   * Interacts with the plugin subsystem.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  plugins(msg: any, match: any): string;

  /**
   * Removes a dank time from the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  removeTime(msg: any, match: any): string;

  /**
   * Gets the release notes of the current version.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  whatsNewMessage(msg: any, match: any): string;
}
