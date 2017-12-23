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
   * Prints the current settings of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  chatSettings(msg: any, match: any): string;

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
   * Removes a dank time from the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  removeTime(msg: any, match: any): string;

  /**
   * Updates the chat's time zone.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  setTimezone(msg: any, match: any): string;

  /**
   * Updates the chat's first score multiplier.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  setMultiplier(msg: any, match: any): string;

  /**
   * Sets the number of random dank times per day for the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  setDailyRandomTimes(msg: any, match: any): string;

  /**
   * Sets the points for random daily dank times for the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  setDailyRandomTimesPoints(msg: any, match: any): string;

  /**
   * Toggles whether the chat auto-posts notifications about NORMAL dank times.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  toggleNotifications(msg: any, match: any): string;

  /**
   * Toggles whether the chat auto-posts a leaderboard 1 minute after every dank time.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  toggleAutoLeaderboards(msg: any, match: any): string;

  /**
   * Toggles whether the chat announces the first user to score.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  toggleFirstNotifications(msg: any, match: any): string;

  /**
   * Toggles whether the bottom 10% of players get a handicap multiplier bonus.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  toggleHandicaps(msg: any, match: any): string;

  /**
   * Gets the entire release log, formatted neatly.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  getReleaseLog(msg: any, match: any): string;

  /**
   * Toggles hardcore mode.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  toggleHardcoreMode(msg: any, match: any): string;
}
