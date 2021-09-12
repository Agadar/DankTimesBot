import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../../chat/chat";
import { User } from "../../chat/user/user";

/** Holds functions that take a 'msg' and a 'match' parameter, and return string messages. */
export interface IDankTimesBotCommands {

  /**
   * Starts the specified chat so that it records dank time texts.
   * Only prints a warning if the chat is already running.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  startChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Stops the specified chat so that it stops recording dank time texts.
   * Only prints a warning if the chat isn't already stopped.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  stopChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Resets the scores of the specified chat.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  resetChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Prints the current settings values of the chat identified in the msg object.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  settings(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Prints the current settings descriptions of the chat identified in the msg object.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  settingshelp(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Sets a setting of the chat identified in the msg object.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  set(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Prints the NORMAL dank times of the chat identified in the msg object.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  dankTimes(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Prints the leaderboard of the chat identified in the msg object.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  leaderBoard(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Prints the available commands to the chat identified in the msg object.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  help(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Adds a new dank time to the chat.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  addTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Interacts with the plugin subsystem.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  plugins(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Removes a dank time from the chat.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  removeTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;

  /**
   * Gets the release notes of the current version.
   * @param chat The chat from which the command was called.
   * @param user The user that called the command.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  whatsNewMessage(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string;
}
