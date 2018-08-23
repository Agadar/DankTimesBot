import { IChatRegistry } from "../../chat-registry/i-chat-registry";
import { Chat } from "../../chat/chat";
import { CoreSettingsNames } from "../../chat/settings/core-settings-names";
import { IDankTimeScheduler } from "../../dank-time-scheduler/i-dank-time-scheduler";
import { DankTime } from "../../dank-time/dank-time";
import { Release } from "../../misc/release";
import { PluginHost } from "../../plugin-host/plugin-host";
import { AbstractPlugin } from "../../plugin-host/plugin/plugin";
import { ITelegramClient } from "../../telegram-client/i-telegram-client";
import { IUtil } from "../../util/i-util";
import { IDankTimesBotCommands } from "./i-danktimesbot-commands";

/** Holds functions that take a 'msg' and a 'match' parameter, and return string messages. */
export class DankTimesBotCommands implements IDankTimesBotCommands {

  constructor(
    private readonly tgClient: ITelegramClient,
    private readonly chatRegistry: IChatRegistry,
    private readonly scheduler: IDankTimeScheduler,
    private readonly util: IUtil,
    private readonly releaseLog: Release[],
    private readonly version: string,
  ) { }

  /**
   * Starts the specified chat so that it records dank time texts.
   * Only prints a warning if the chat is already running.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public startChat(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    if (chat.running) {
      return "⚠️ The bot is already running!";
    }
    chat.running = true;
    this.scheduler.scheduleAllOfChat(chat);
    return "🏃 The bot is now running! Hit '/help' for available commands.";
  }

  /**
   * Stops the specified chat so that it stops recording dank time texts.
   * Only prints a warning if the chat isn't already stopped.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public stopChat(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    if (chat.running) {
      chat.running = false;
      this.scheduler.unscheduleAllOfChat(chat);
      return "🛑 The bot is now stopped! Hit '/start' to restart.";
    }
    return "⚠️ The bot is already stopped!";
  }

  /**
   * Resets the scores of the specified chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public resetChat(msg: any, match: any): string {
    this.chatRegistry.getOrCreateChat(msg.chat.id).awaitingResetConfirmation = msg.from.id;
    return "🤔 Are you sure? Type 'yes' to confirm.";
  }

  /**
   * Prints the current settings values of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public settings(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    return chat.getFormattedSettingsValues();
  }

  /**
   * Prints the current settings descriptions of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public settingshelp(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    return chat.getFormattedSettingsDescriptions();
  }

  /**
   * Sets a setting of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public set(msg: any, match: any): string {

    // Split string and ensure it contains at least 2 items.
    const split = match.input.split(" ");
    if (split.length < 3) {
      return "⚠️ Not enough arguments! Format: /set [name] [value]";
    }

    // Update the chat setting
    try {
      const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
      const settingname = split[1];
      const settingvalue = split[2];
      chat.setSetting(settingname, settingvalue);

      // Altering some settings has side-effects:
      if (settingname === CoreSettingsNames.timezone) {
        this.doTimezoneSettingSideEffects(chat);
      } else if (settingname === CoreSettingsNames.numberOfRandomTimes) {
        this.doNumberOfRandomTimesSettingSideEffects(chat);
      } else if (settingname === CoreSettingsNames.notifications) {
        this.doNotificationsSettingSideEffects(chat);
      } else if (settingname === CoreSettingsNames.autoLeaderboards) {
        this.doAutoLeaderboardsSettingSideEffects(chat);
      }

      return "🎉 Updated the setting!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  /**
   * Prints the NORMAL dank times of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public dankTimes(msg: any, match: any): string {
    let dankTimes = "<b>⏰ DANK TIMES</b>\n";
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    for (const time of chat.dankTimes) {
      dankTimes +=
        `\ntime: ${this.util.padNumber(time.hour)}:`
        + `${this.util.padNumber(time.minute)}:00    points: ${time.points}    texts: `;
      for (const text of time.texts) {
        dankTimes += `${text}, `;
      }
      dankTimes = dankTimes.slice(0, -2);
    }
    return dankTimes;
  }

  /**
   * Prints the leaderboard of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public leaderBoard(msg: any, match: any): string {
    return this.chatRegistry.getOrCreateChat(msg.chat.id).generateLeaderboard();
  }

  /**
   * Prints the available commands to the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public help(msg: any, match: any): string {
    let help = "<b>ℹ️ AVAILABLE COMMANDS</b>\n";
    this.tgClient.commands.forEach((command) => help += "\n/" + command.name + " - " + command.description);
    return help;
  }

  /**
   * Adds a new dank time to the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public addTime(msg: any, match: any): string {

    const commaSplit: string[] = match.input.split(",").filter((part: string) => !!part);
    const spaceSplit: string[] = commaSplit[0].split(" ").filter((part: string) => !!part);

    // Ensure it contains at least 4 items.
    if (spaceSplit.length < 5) {
      return "⚠️ Not enough arguments! Format: /addtime [hour] [minute] [points] [text1],[text2], etc.";
    }

    // Identify and verify arguments.
    const hour = Number(spaceSplit[1]);
    const minute = Number(spaceSplit[2]);
    const points = Number(spaceSplit[3]);

    if (isNaN(hour)) {
      return "⚠️ The hour must be a number!";
    }
    if (isNaN(minute)) {
      return "⚠️ The minute must be a number!";
    }
    if (isNaN(points)) {
      return "⚠️ The points must be a number!";
    }

    // Construct the texts.
    for (let i = 0; i < commaSplit.length; i++) {
      commaSplit[i] = commaSplit[i].trim();
    }
    const texts = [spaceSplit.slice(4).join(" ")].concat(commaSplit.slice(1));

    // Subscribe new dank time for the chat, replacing any with the same hour and minute.
    try {
      const dankTime = new DankTime(hour, minute, texts, points);
      const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
      chat.addDankTime(dankTime);

      // Reschedule notifications just to make sure, if applicable.
      if (chat.running) {
        if (chat.notifications) {
          this.scheduler.unscheduleDankTime(chat, dankTime);
          this.scheduler.scheduleDankTime(chat, dankTime);
        }
        if (chat.autoLeaderboards) {
          this.scheduler.unscheduleAutoLeaderboard(chat, dankTime);
          this.scheduler.scheduleAutoLeaderboard(chat, dankTime);
        }
      }
      return "⏰ Added the new time!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  /**
   * Lists the names of the currently active plugins.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public plugins(msg: any, match: any): string {
    let out = "<b>🔌 PLUGINS</b>\n";
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    chat.pluginhost.plugins.forEach((plugin: AbstractPlugin) => {
      out += `\n- ${plugin.name}`;
    });
    return out;
  }

  /**
   * Removes a dank time from the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public removeTime(msg: any, match: any): string {

    // Split string and ensure it contains at least 2 items.
    const split = match.input.split(" ");
    if (split.length < 3) {
      return "⚠️ Not enough arguments! Format: /removetime [hour] [minute]";
    }

    // Identify and verify arguments.
    const hour = Number(split[1]);
    const minute = Number(split[2]);
    if (isNaN(hour)) {
      return "⚠️ The hour must be a number!";
    }
    if (isNaN(minute)) {
      return "⚠️ The minute must be a number!";
    }

    // Remove dank time if it exists, otherwise just send an info message.
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    const dankTime = chat.getDankTime(hour, minute);

    if (dankTime !== null && chat.removeDankTime(hour, minute)) {
      this.scheduler.unscheduleDankTime(chat, dankTime);
      this.scheduler.unscheduleAutoLeaderboard(chat, dankTime);
      return "🚮 Removed the time!";
    } else {
      return "⚠️ No dank time known with that hour and minute!";
    }
  }

  /**
   * Gets the release notes of the current version.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public whatsNewMessage(msg: any, match: any): string {
    return this.util.releaseLogToWhatsNewMessage(this.releaseLog);
  }

  private doTimezoneSettingSideEffects(chat: Chat): void {
    this.scheduler.unscheduleAllOfChat(chat);
    this.scheduler.scheduleAllOfChat(chat);
  }

  private doNumberOfRandomTimesSettingSideEffects(chat: Chat): void {
    if (chat.running) {
      this.scheduler.unscheduleRandomDankTimesOfChat(chat);
      this.scheduler.scheduleRandomDankTimesOfChat(chat);

      if (chat.autoLeaderboards) {
        this.scheduler.unscheduleAutoLeaderboardsOfChat(chat);
        this.scheduler.scheduleAutoLeaderboardsOfChat(chat);
      }
    }
  }

  private doNotificationsSettingSideEffects(chat: Chat): void {
    if (chat.running) {
      this.scheduler.unscheduleDankTimesOfChat(chat);

      if (chat.notifications) {
        this.scheduler.scheduleDankTimesOfChat(chat);
      }
    }
  }

  private doAutoLeaderboardsSettingSideEffects(chat: Chat): void {
    if (chat.running) {
      this.scheduler.unscheduleAutoLeaderboardsOfChat(chat);

      if (chat.autoLeaderboards) {
        this.scheduler.scheduleAutoLeaderboardsOfChat(chat);
      }
    }
  }
}
