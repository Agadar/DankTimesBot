import TelegramBot from "node-telegram-bot-api";
import { AlterUserScoreArgs } from "../../chat/alter-user-score-args";
import { Chat } from "../../chat/chat";
import { CoreSettingsNames } from "../../chat/settings/core-settings-names";
import { User } from "../../chat/user/user";
import { IDankTimeScheduler } from "../../dank-time-scheduler/i-dank-time-scheduler";
import { DankTime } from "../../dank-time/dank-time";
import { Release } from "../../misc/release";
import { AbstractPlugin } from "../../plugin-host/plugin/plugin";
import { IUtil } from "../../util/i-util";
import { BotCommandRegistry } from "../bot-command-registry";
import { IDankTimesBotCommands } from "./i-danktimesbot-commands";

/** Holds functions that take a 'msg' and a 'match' parameter, and return string messages. */
export class DankTimesBotCommands implements IDankTimesBotCommands {

  constructor(
    private readonly commandsRegistry: BotCommandRegistry,
    private readonly scheduler: IDankTimeScheduler,
    private readonly util: IUtil,
    private readonly releaseLog: Release[],
  ) { }

  public startChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    if (chat.running) {
      return "⚠️ The bot is already running!";
    }
    chat.running = true;
    this.scheduler.scheduleAllOfChat(chat);
    return "🏃 The bot is now running! Hit '/help' for available commands.";
  }

  public stopChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    if (chat.running) {
      chat.running = false;
      this.scheduler.unscheduleAllOfChat(chat);
      return "🛑 The bot is now stopped! Hit '/start' to restart.";
    }
    return "⚠️ The bot is already stopped!";
  }

  public resetChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    const finalLeaderboard = chat.generateLeaderboard(true);
    const outputText = "Leaderboard has been reset!\n\n" + finalLeaderboard;
    chat.resetScores();
    return outputText;
  }

  public settings(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    return chat.getFormattedSettingsValues();
  }

  public settingshelp(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    return chat.getFormattedSettingsDescriptions();
  }

  public set(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {

    // Split string and ensure it contains at least 2 items.
    const split = match.split(" ");
    if (split.length < 2) {
      return "⚠️ Not enough arguments! Format: /set [name] [value]";
    }

    // Update the chat setting
    try {
      const settingname = split[0];
      const settingvalue = split[1];
      chat.setSetting(settingname, settingvalue);

      // Altering some settings has side-effects:
      if (settingname === CoreSettingsNames.timezone) {
        this.doTimezoneSettingSideEffects(chat);
      } else if (settingname === CoreSettingsNames.randomtimesFrequency) {
        this.doNumberOfRandomTimesSettingSideEffects(chat);
      } else if (settingname === CoreSettingsNames.normaltimesNotifications) {
        this.doNotificationsSettingSideEffects(chat);
      }

      return "🎉 Updated the setting!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  public dankTimes(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    let dankTimes = "<b>⏰ DANK TIMES</b>\n";
    for (const time of chat.dankTimes) {
      dankTimes +=
        `\ntime: ${this.util.padNumber(time.hour)}:`
        + `${this.util.padNumber(time.minute)}:00    points: ${time.getPoints()}    texts: `;
      for (const text of time.texts) {
        dankTimes += `${text}, `;
      }
      dankTimes = dankTimes.slice(0, -2);
    }
    return dankTimes;
  }

  public leaderBoard(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    return chat.generateLeaderboard();
  }

  public help(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    const sortedCommands = this.commandsRegistry.getCommandsForHelpOutput();
    let help = "<b>ℹ️ AVAILABLE COMMANDS</b>\n";
    sortedCommands.forEach((command) => help += "\n/" + command.names[0] + " - " + command.description);
    return help;
  }

  public addTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {

    const commaSplit: string[] = match.split(",").filter((part: string) => !!part);
    const spaceSplit: string[] = commaSplit[0].split(" ").filter((part: string) => !!part);

    // Ensure it contains at least 4 items.
    if (spaceSplit.length < 4) {
      return "⚠️ Not enough arguments! Format: /addtime [hour] [minute] [points] [text1],[text2], etc.";
    }

    // Identify and verify arguments.
    const hour = Number(spaceSplit[0]);
    const minute = Number(spaceSplit[1]);
    const points = Number(spaceSplit[2]);

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
    const texts = [spaceSplit.slice(3).join(" ")].concat(commaSplit.slice(1));

    // Subscribe new dank time for the chat, replacing any with the same hour and minute.
    try {
      const dankTime = new DankTime(hour, minute, texts, () => points);
      chat.addDankTime(dankTime);

      // Reschedule notifications just to make sure, if applicable.
      if (chat.running) {
        if (chat.normaltimesNotifications) {
          this.scheduler.unscheduleDankTime(chat, dankTime);
          this.scheduler.scheduleDankTime(chat, dankTime);
        }
      }
      return "⏰ Added the new time!";
    } catch (err) {
      return "⚠️ " + err.message;
    }
  }

  public plugins(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    let out = "<b>🔌 PLUGINS</b>\n";
    chat.pluginhost.plugins.forEach((plugin: AbstractPlugin) => {
      out += `\n- ${plugin.name} ${plugin.version}`;
    });
    return out;
  }

  public removeTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {

    // Split string and ensure it contains at least 2 items.
    const split = match.split(" ");
    if (split.length < 2) {
      return "⚠️ Not enough arguments! Format: /removetime [hour] [minute]";
    }

    // Identify and verify arguments.
    const hour = Number(split[0]);
    const minute = Number(split[1]);
    if (isNaN(hour)) {
      return "⚠️ The hour must be a number!";
    }
    if (isNaN(minute)) {
      return "⚠️ The minute must be a number!";
    }

    // Remove dank time if it exists, otherwise just send an info message.
    const dankTime = chat.getDankTime(hour, minute);

    if (dankTime !== null && chat.removeDankTime(hour, minute)) {
      this.scheduler.unscheduleDankTime(chat, dankTime);
      return "🚮 Removed the time!";
    } else {
      return "⚠️ No dank time known with that hour and minute!";
    }
  }

  public whatsNewMessage(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    return this.util.releaseLogToWhatsNewMessage(this.releaseLog);
  }

  public donate(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
    if (!msg.reply_to_message) {
      return "✋  I only work when you reply to a message by the user you are trying to donate to";
    }
    if (msg.reply_to_message?.from?.id === user.id) {
      return "✋  Donating to yourself? Weirdo";
    }
    if (!match) {
      return "✋  Not enough arguments! Format: /donate [amount]";
    }
    let amount = Number(match);

    if (isNaN(amount) || (amount % 1 !== 0) || amount < 1 ) {
      return "✋  The amount has to be a whole numeric value";
    }
    if (amount > user.score) {
      return "✋  You can't give away more than you own";
    }
    const recipientId = msg.reply_to_message?.from?.id;

    if (!recipientId) {
      return "⚠️  Failed to identify to whomst you're donating";
    }
    const recipient: User = chat.getOrCreateUser(recipientId, msg.reply_to_message?.from?.username);
    chat.alterUserScore(new AlterUserScoreArgs(user, -amount, AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME,
      AlterUserScoreArgs.DONATION_GIVEN_REASON));
    amount = chat.alterUserScore(new AlterUserScoreArgs(recipient, amount,
      AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME, AlterUserScoreArgs.DONATION_RECEIVED_REASON));

    return `🎉 ${user.name} donated ${amount} internet points to ${recipient.name} 🎉`;
  }

  private doTimezoneSettingSideEffects(chat: Chat): void {
    this.scheduler.unscheduleAllOfChat(chat);
    this.scheduler.scheduleAllOfChat(chat);
  }

  private doNumberOfRandomTimesSettingSideEffects(chat: Chat): void {
    if (chat.running) {
      this.scheduler.unscheduleRandomDankTimesOfChat(chat);
      this.scheduler.scheduleRandomDankTimesOfChat(chat);
    }
  }

  private doNotificationsSettingSideEffects(chat: Chat): void {
    if (chat.running) {
      this.scheduler.unscheduleDankTimesOfChat(chat);

      if (chat.normaltimesNotifications) {
        this.scheduler.scheduleDankTimesOfChat(chat);
      }
    }
  }
}
