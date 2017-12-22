import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { IDankTimeScheduler } from "../dank-time-scheduler/i-dank-time-scheduler";
import { DankTime } from "../dank-time/dank-time";
import { Release } from "../misc/release";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { IUtil } from "../util/i-util";
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
   * Prints the current settings of the chat identified in the msg object.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public chatSettings(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    let settings = "<b>🛠️ SETTINGS</b>\n";
    settings += "\n<b>Announce first to score:</b> " + (chat.firstNotifications ? "on" : "off");
    settings += "\n<b>Auto-post leaderboards:</b> " + (chat.autoLeaderboards ? "on" : "off");
    settings += "\n<b>Chat time zone:</b> " + chat.timezone;
    settings += "\n<b>Dank time notifications:</b> " + (chat.notifications ? "on" : "off");
    settings += "\n<b>Handicaps:</b> " + (chat.handicaps ? "on" : "off");
    settings += "\n<b>Hardcore mode:</b> " + (chat.hardcoreMode ? "on" : "off");
    settings += "\n<b>Multiplier:</b> x" + chat.multiplier;
    settings += "\n<b>Random dank times per day:</b> " + chat.numberOfRandomTimes;
    settings += "\n<b>Random dank time points:</b> " + chat.pointsPerRandomTime;
    settings += "\n<b>Server time:</b> " + new Date();
    settings += "\n<b>Status:</b> " + (chat.running ? "running" : "awaiting start");
    settings += "\n<b>Version:</b> " + this.version;
    return settings;
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
   * Updates the chat's time zone.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public setTimezone(msg: any, match: any): string {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(" ");
    if (split.length < 2) {
      return "⚠️ Not enough arguments! Format: /settimezone [timezone]";
    }

    // Update the time zone.
    try {
      const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
      chat.timezone = split[1];

      // Reschedule due to timezone change.
      this.scheduler.unscheduleAllOfChat(chat);
      this.scheduler.scheduleAllOfChat(chat);
      return "🎉 Updated the time zone!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  /**
   * Updates the chat's first score multiplier.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public setMultiplier(msg: any, match: any): string {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(" ");
    if (split.length < 2) {
      return "⚠️ Not enough arguments! Format: /setmultiplier [number]";
    }

    const multiplier = Number(split[1]);
    if (isNaN(multiplier)) {
      return "⚠️ The multiplier must be a number!";
    }

    // Update the time zone.
    try {
      this.chatRegistry.getOrCreateChat(msg.chat.id).multiplier = multiplier;
      return "🎉 Updated the multiplier!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  /**
   * Sets the number of random dank times per day for the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public setDailyRandomTimes(msg: any, match: any): string {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(" ");
    if (split.length < 2) {
      return "⚠️ Not enough arguments! Format: /setdailyrandomfrequency [number]";
    }

    const dailyRandomTimes = Number(split[1]);
    if (isNaN(dailyRandomTimes)) {
      return "⚠️ The frequency must be a number!";
    }

    // Do the update.
    try {
      const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
      chat.numberOfRandomTimes = dailyRandomTimes;

      // Reschedule due to removed random times.
      if (chat.running) {
        this.scheduler.unscheduleRandomDankTimesOfChat(chat);
        this.scheduler.scheduleRandomDankTimesOfChat(chat);

        if (chat.autoLeaderboards) {
          this.scheduler.unscheduleAutoLeaderboardsOfChat(chat);
          this.scheduler.scheduleAutoLeaderboardsOfChat(chat);
        }
      }
      return "🎉 Updated the number of random dank times per day!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  /**
   * Sets the points for random daily dank times for the chat.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public setDailyRandomTimesPoints(msg: any, match: any): string {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(" ");
    if (split.length < 2) {
      return "⚠️ Not enough arguments! Format: /setdailyrandompoints [number]";
    }

    const pointsPerRandomTime = Number(split[1]);
    if (isNaN(pointsPerRandomTime)) {
      return "⚠️ The points must be a number!";
    }

    try {
      this.chatRegistry.getOrCreateChat(msg.chat.id).pointsPerRandomTime = pointsPerRandomTime;
      return "🎉 Updated the points for random daily dank times!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  /**
   * Toggles whether the chat auto-posts notifications about NORMAL dank times.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public toggleNotifications(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    chat.notifications = !chat.notifications;

    if (chat.notifications) {
      if (chat.running) {
        this.scheduler.scheduleDankTimesOfChat(chat);
      }
      return "🔔 Normal dank time notifications are now enabled!";
    } else {
      if (chat.running) {
        this.scheduler.unscheduleDankTimesOfChat(chat);
      }
      return "🔕 Normal dank time notifications are now disabled! (Random dank time notifications remain enabled.)";
    }
  }

  /**
   * Toggles whether the chat auto-posts a leaderboard 1 minute after every dank time.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public toggleAutoLeaderboards(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    chat.autoLeaderboards = !chat.autoLeaderboards;

    if (chat.autoLeaderboards) {
      if (chat.running) {
        this.scheduler.scheduleAutoLeaderboardsOfChat(chat);
      }
      return "🔔 Automatic leaderboard posting is now enabled!";
    } else {
      if (chat.running) {
        this.scheduler.unscheduleAutoLeaderboardsOfChat(chat);
      }
      return "🔕 Automatic leaderboard posting is now disabled!";
    }
  }

  /**
   * Toggles whether the chat announces the first user to score.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public toggleFirstNotifications(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    chat.firstNotifications = !chat.firstNotifications;
    return chat.firstNotifications ? "🔔 Announcements for first users to score are now enabled!"
      : "🔕 Announcements for first users to score are now disabled!";
  }

  /**
   * Toggles whether the bottom x% of players get a handicap multiplier bonus.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public toggleHandicaps(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    chat.handicaps = !chat.handicaps;
    return chat.handicaps ? "♿ Handicaps are now enabled! Users with the lowest scores now earn more points!"
      : "🚴 Handicaps are now disabled!";
  }

  /**
   * Gets the entire release log, formatted neatly.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public getReleaseLog(msg: any, match: any): string {
    let reply = "<b>🗒️ RELEASES</b>\n";
    this.releaseLog.forEach((release) => {
      reply += "\n";
      reply += "<b>Version:</b> " + release.version + "\n";
      reply += "<b>Date:</b> " + release.date + "\n";
      reply += "<b>Changes:</b>\n";
      release.changes.forEach((change) => {
        reply += "- " + change + "\n";
      });
    });
    return reply;
  }

  /**
   * Toggles hardcore mode.
   * @param msg The message object from the Telegram api.
   * @param match The regex matched object from the Telegram api.
   * @returns The response.
   */
  public toggleHardcoreMode(msg: any, match: any): string {
    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    chat.hardcoreMode = !chat.hardcoreMode;
    return chat.hardcoreMode
      ? "☠️ Hardcore mode is now enabled! Every day, those who did not score the previous day are punished!"
      : "👶 Hardcore mode is now disabled!";
  }
}
