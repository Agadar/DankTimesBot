import { Moment } from "moment-timezone";
import { BasicDankTime } from "../dank-time/basic-dank-time";
import { DankTime } from "../dank-time/dank-time";
import {
  ChatMessageEventArguments,
} from "../plugin-host/plugin-events/event-arguments/chat-message-event-arguments";
import {
  LeaderboardPostEventArguments,
} from "../plugin-host/plugin-events/event-arguments/leaderboard-post-event-arguments";
import { PostUserScoreChangedEventArguments } from "../plugin-host/plugin-events/event-arguments/post-user-score-changed-event-arguments";
import { PreUserScoreChangedEventArguments } from "../plugin-host/plugin-events/event-arguments/pre-user-score-changed-event-arguments";
import { PluginEvent } from "../plugin-host/plugin-events/plugin-event-types";
import { PluginHost } from "../plugin-host/plugin-host";
import { IUtil } from "../util/i-util";
import { AlterUserScoreArgs } from "./alter-user-score-args";
import { BasicChat } from "./basic-chat";
import { Leaderboard } from "./leaderboard/leaderboard";
import { ChatSetting } from "./settings/chat-setting";
import { CoreSettingsNames } from "./settings/core-settings-names";
import { User } from "./user/user";

export class Chat {

  private myId: number;
  private myLastHour: number;
  private myLastMinute: number;
  private myLastLeaderboard?: Leaderboard = undefined;
  private pluginHost: PluginHost;

  /**
   * Creates a new Chat object.
   * @param moment Reference to timezone import.
   * @param util Utility functions.
   * @param id The chat's unique Telegram id.
   * @param pluginhost This chat's plugin host.
   * @param settings This chat's settings.
   * @param running Whether this bot is running for this chat.
   * @param lastHour The hour of the last valid dank time being proclaimed.
   * @param lastMinute The minute of the last valid dank time being proclaimed.
   * @param users A map with the users, indexed by user id's.
   * @param dankTimes The dank times known in this chat.
   * @param randomDankTimes The daily randomly generated dank times in this chat.
   */
  constructor(
    private readonly moment: any,
    private readonly util: IUtil,
    id: number,
    pluginhost: PluginHost,
    private readonly settings: Map<string, ChatSetting<any>>,
    public running = false,
    lastHour = 0,
    lastMinute = 0,
    public readonly users = new Map<number, User>(),
    public readonly dankTimes = new Array<DankTime>(),
    public randomDankTimes = new Array<DankTime>()) {

    this.id = id;
    this.lastHour = lastHour;
    this.lastMinute = lastMinute;
    this.pluginHost = pluginhost;
  }

  public set id(id: number) {
    if (id % 1 !== 0) {
      throw new RangeError("The id must be a whole number!");
    }
    this.myId = id;
  }

  public get id(): number {
    return this.myId;
  }

  public get timezone(): string {
    return this.getSetting<string>(CoreSettingsNames.timezone);
  }

  public set lastHour(lastHour: number) {
    if (lastHour < 0 || lastHour > 23 || lastHour % 1 !== 0) {
      throw new RangeError("The hour must be a whole number between 0 and 23!");
    }
    this.myLastHour = lastHour;
  }

  public get lastHour(): number {
    return this.myLastHour;
  }

  public set lastMinute(lastMinute: number) {
    if (lastMinute < 0 || lastMinute > 59 || lastMinute % 1 !== 0) {
      throw new RangeError("The minute must be a whole number between 0 and 59!");
    }
    this.myLastMinute = lastMinute;
  }

  public get lastMinute(): number {
    return this.myLastMinute;
  }

  public get randomtimesFrequency(): number {
    return this.getSetting<number>(CoreSettingsNames.randomtimesFrequency);
  }

  public get firstMultiplier(): number {
    return this.getSetting<number>(CoreSettingsNames.firstMultiplier);
  }

  /**
   * Gets the current random dank time points. This is a method instead of a getter, so that
   * random danktimes are automatically referring to the correct number of points when
   * this setting is changed.
   */
  public getRandomtimesPoints(): number {
    return this.getSetting<number>(CoreSettingsNames.randomtimesPoints);
  }

  public get pluginhost(): PluginHost {
    return this.pluginHost;
  }

  /**
   * Sets the setting with the supplied name. Throws an exception if the
   * setting does not exist or the supplied value is incorrect.
   * @param name The name of the setting to set.
   * @param value The value of the setting to set.
   */
  public setSetting(name: string, value: string) {
    if (!this.settings.has(name)) {
      throw new RangeError(`Setting '${name}' does not exist!`);
    }
    const setting = this.settings.get(name) as ChatSetting<any>;
    setting.setValueFromString(value);

    // Altering some settings has side-effects:
    if (name === CoreSettingsNames.randomtimesFrequency) {
      this.randomDankTimes.splice(this.randomtimesFrequency);
    }
  }

  /**
   * Gets the value of the setting with the supplied name. Throws an exception if the
   * setting does not exist.
   * @param name The name of the setting to get.
   */
  public getSetting<T>(name: string): T {
    if (!this.settings.has(name)) {
      throw new RangeError(`Setting '${name}' does not exist!`);
    }
    const setting = this.settings.get(name) as ChatSetting<any>;
    return setting.value;
  }

  /**
   * Adds a new normal dank time to this chat, replacing any dank time that has
   * the same hour and minute.
   */
  public addDankTime(dankTime: DankTime): void {
    const existing = this.getDankTime(dankTime.hour, dankTime.minute);
    if (existing) {
      this.dankTimes.splice(this.dankTimes.indexOf(existing), 1);
    }
    this.dankTimes.push(dankTime);
    this.dankTimes.sort(DankTime.compare);
  }

  /**
   * Gets the user with the supplied user id, otherwise creates and returns a new one.
   */
  public getOrCreateUser(userId: number, userName = "anonymous"): User {

    if (!this.users.has(userId)) {
      this.users.set(userId, new User(userId, userName));
    }
    const user = this.users.get(userId) as User;

    if (user.name !== userName) {
      user.name = userName;
    }
    return user;
  }

  public removeUser(userId: number): User | null {
    const userToRemove = this.users.get(userId);
    this.users.delete(userId);
    return userToRemove ? userToRemove : null;
  }

  /**
   * Gets an array of the users, sorted by scores.
   */
  public sortedUsers(): User[] {
    const usersArr = new Array<User>();
    this.users.forEach((user) => usersArr.push(user));
    usersArr.sort(User.compare);
    return usersArr;
  }

  /**
   * Generates new random dank times for this chat, clearing old ones.
   */
  public generateRandomDankTimes(): DankTime[] {
    this.randomDankTimes = new Array<DankTime>();

    for (let i = 0; i < this.randomtimesFrequency; i++) {
      const now = this.moment().tz(this.timezone);

      now.add(Math.floor(Math.random() * 23), "hours");
      now.minutes(Math.floor(Math.random() * 59));

      if (!this.hourAndMinuteAlreadyRegistered(now.hours(), now.minutes())) {
        const text = this.util.padNumber(now.hours()) + this.util.padNumber(now.minutes());
        this.randomDankTimes.push(new DankTime(now.hours(), now.minutes(), [text],
          this.getRandomtimesPoints.bind(this), true));
      }
    }
    return this.randomDankTimes;
  }

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): BasicChat {

    const basicSettings = Array.from(this.settings.values()).map((setting) => {
      return {
        name: setting.name,
        value: setting.value,
      };
    });

    const basicDankTimes = this.dankTimes.map((dankTime) => {
      return {
        hour: dankTime.hour,
        minute: dankTime.minute,
        points: dankTime.getPoints(),
        texts: dankTime.texts,
      } as BasicDankTime;
    });

    return {
      dankTimes: basicDankTimes,
      id: this.myId,
      lastHour: this.myLastHour,
      lastMinute: this.myLastMinute,
      running: this.running,
      settings: basicSettings,
      users: this.sortedUsers(),
    };
  }

  /**
   * Processes a message, awarding or punishing points etc. where applicable.
   * @returns A reply, or nothing if no reply is suitable/needed.
   */
  public processMessage(msg: any): string[] {

    let output: string[] = [];
    const messageTimeout: boolean = this.moment.tz("UTC").unix() - msg.date >= 60;

    // Ignore the message if it was sent more than 1 minute ago.
    if (messageTimeout) {
      return output;
    }

    const user = this.getOrCreateUser(msg.from.id, msg.from.username);
    if (this.running) {
      output = this.handleDankTimeInputMessage(user, msg.text, msg.date, this.moment.tz(this.timezone));
    }
    msg.text = this.util.cleanText(msg.text);

    // Chat message event
    const eventArgs = new ChatMessageEventArguments(this, user, msg, output);
    this.pluginHost.triggerEvent(PluginEvent.ChatMessage, eventArgs);
    return eventArgs.botReplies;
  }

  /**
   * Resets the scores of all the users.
   */
  public resetScores(): void {
    this.users.forEach((user) => user.resetScore());
  }

  /**
   * Removes the dank time with the specified hour and minute.
   * @returns Whether a dank time was found and removed.
   */
  public removeDankTime(hour: number, minute: number): boolean {
    const dankTime = this.getDankTime(hour, minute);
    if (dankTime) {
      this.dankTimes.splice(this.dankTimes.indexOf(dankTime), 1);
      return true;
    }
    return false;
  }

  /**
   * Returns whether the leaderboard has changed since the last time this.generateLeaderboard(...) was generated.
   */
  public leaderboardChanged(): boolean {
    for (const user of this.users) {
      if (user[1].lastScoreChange !== 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generates the leaderboard of this chat.
   * @param final If true, prints 'FINAL LEADERBOARD' instead of 'LEADERBOARD'.
   */
  public generateLeaderboard(final = false): string {

    // Construct string to return.
    const oldLeaderboard = this.myLastLeaderboard;
    this.myLastLeaderboard = new Leaderboard(Array.from(this.users.values()));
    let leaderboard = "<b>🏆 " + (final ? "FINAL " : "") + "LEADERBOARD</b>\n";
    leaderboard += this.myLastLeaderboard.toString(oldLeaderboard);

    // Reset last score change values of all users.
    const userIterator = this.users.values();
    let user = userIterator.next();
    while (!user.done) {
      user.value.resetLastScoreChange();
      user = userIterator.next();
    }

    // Allow plugins to change the leaderboard text.
    const eventArgs = new LeaderboardPostEventArguments(this, leaderboard);
    this.pluginHost.triggerEvent(PluginEvent.LeaderboardPost, eventArgs);
    return eventArgs.leaderboardText;
  }

  /**
   * Gets the normal dank time that has the specified hour and minute.
   * @returns The dank time or null if none has the specified hour and minute.
   */
  public getDankTime(hour: number, minute: number): DankTime | null {
    for (const dankTime of this.dankTimes) {
      if (dankTime.hour === hour && dankTime.minute === minute) {
        return dankTime;
      }
    }
    return null;
  }

  public hardcoreModeCheck(timestamp: number) {
    if (this.hardcoremodeEnabled) {
      const day = 24 * 60 * 60;
      this.users.forEach((user) => {
        if (timestamp - user.lastScoreTimestamp >= day) {
          let punishBy = Math.round(user.score * this.hardcoremodePunishFraction);
          punishBy = Math.max(punishBy, 10);
          const alterUserScoreArgs = new AlterUserScoreArgs(user, -punishBy, AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME,
            AlterUserScoreArgs.HARDCOREMODE_PUNISHMENT_REASON, timestamp);
          this.alterUserScore(alterUserScoreArgs);
        }
      });
    }
  }

/**
 * Adds an amount to the user's DankTimes score. Fires user score change events which plugins can listen to.
 *
 * @param alterUserScoreArgs The required arguments.
 * @returns The actual number with which the user's score was altered after corrections.
 */
  public alterUserScore(alterUserScoreArgs: AlterUserScoreArgs): number {
    const preEvent = new PreUserScoreChangedEventArguments(this, alterUserScoreArgs.user, alterUserScoreArgs.amount,
      alterUserScoreArgs.reason, alterUserScoreArgs.nameOfOriginPlugin);
    this.pluginHost.triggerEvent(PluginEvent.PreUserScoreChange, preEvent);

    const correctedAmount = alterUserScoreArgs.user.alterScore(preEvent.changeInScore, alterUserScoreArgs.timestamp);

    const postEvent = new PostUserScoreChangedEventArguments(this, alterUserScoreArgs.user, correctedAmount,
      alterUserScoreArgs.reason, alterUserScoreArgs.nameOfOriginPlugin);
    this.pluginHost.triggerEvent(PluginEvent.PostUserScoreChange, postEvent);

    return correctedAmount;
  }

  /**
   * Returns a formatted string representation of this chat's settings values.
   */
  public getFormattedSettingsValues(): string {
    const sortedSettings = [...this.settings.entries()].sort();
    let formatted = "<b>🛠️ SETTINGS VALUES</b>\n";
    sortedSettings.forEach((setting) => {
      formatted += `\n<b>${setting[0]}</b> - ${setting[1].value}`;
    });
    return formatted;
  }

  /**
   * Returns a formatted string representation of this chat's settings descriptions.
   */
  public getFormattedSettingsDescriptions(): string {
    const sortedSettings = [...this.settings.entries()].sort();
    let formatted = "<b>🛠️ SETTINGS DESCRIPTIONS</b>\n";
    sortedSettings.forEach((setting) => {
      formatted += `\n<b>${setting[0]}</b> - ${setting[1].description}`;
    });
    return formatted;
  }

  public get normaltimesNotifications(): boolean {
    return this.getSetting<boolean>(CoreSettingsNames.normaltimesNotifications);
  }

  public get autoleaderboards(): boolean {
    return this.getSetting<boolean>(CoreSettingsNames.autoleaderboards);
  }

  private get hardcoremodeEnabled(): boolean {
    return this.getSetting<boolean>(CoreSettingsNames.hardcoremodeEnabled);
  }

  private get hardcoremodePunishFraction(): number {
    return this.getSetting<number>(CoreSettingsNames.hardcoremodePunishFraction);
  }

  private get firstNotifications(): boolean {
    return this.getSetting<boolean>(CoreSettingsNames.firstNotifications);
  }

  private get handicapsEnabled(): boolean {
    return this.getSetting<boolean>(CoreSettingsNames.handicapsEnabled);
  }

  private get handicapsMultiplier(): number {
    return this.getSetting<number>(CoreSettingsNames.handicapsMultiplier);
  }

  private get handicapsBottomFraction(): number {
    return this.getSetting<number>(CoreSettingsNames.handicapsBottomFraction);
  }

  private get punishUntimelyDankTime(): boolean {
    return this.getSetting<boolean>(CoreSettingsNames.punishUntimelyDankTime);
  }

  /**
   * Gets both normal and random dank times that have the specified text.
   */
  private getDankTimesByText(text: string): DankTime[] {
    const found = [];
    for (const dankTime of this.dankTimes.concat(this.randomDankTimes)) {
      if (dankTime.hasText(text)) {
        found.push(dankTime);
      }
    }
    return found;
  }

  private hourAndMinuteAlreadyRegistered(hour: number, minute: number): boolean {
    for (const dankTime of this.dankTimes) {
      if (dankTime.hour === hour && dankTime.minute === minute) {
        return true;
      }
    }
    for (const dankTime of this.randomDankTimes) {
      if (dankTime.hour === hour && dankTime.minute === minute) {
        return true;
      }
    }
    return false;
  }

  private userDeservesHandicapBonus(userId: number) {
    if (!this.handicapsEnabled || this.users.size < 2) {
      return false;
    }
    const sortedUsers = this.sortedUsers();
    let noOfHandicapped = sortedUsers.length * this.handicapsBottomFraction;
    noOfHandicapped = Math.round(noOfHandicapped);
    const handicapped = sortedUsers.slice(-noOfHandicapped);

    for (const entry of handicapped) {
      if (entry.id === userId) {
        return true;
      }
    }
    return false;
  }

  private handleDankTimeInputMessage(user: User, msgText: string, msgUnixTime: number, now: Moment): string[] {
    const output: string[] = [];

    // Gather dank times from the sent text, returning if none was found.
    const dankTimesByText = this.getDankTimesByText(msgText);
    if (dankTimesByText.length < 1) {
      return output;
    }

    let subtractBy = 0;

    for (const dankTime of dankTimesByText) {
      if (now.hours() === dankTime.hour && now.minutes() === dankTime.minute) {

        // If cache needs resetting, do so and award DOUBLE points to the calling user.
        if (this.lastHour !== dankTime.hour || this.myLastMinute !== dankTime.minute) {
          this.users.forEach((user0) => user0.called = false);
          this.lastHour = dankTime.hour;
          this.lastMinute = dankTime.minute;
          let score = dankTime.getPoints() * this.firstMultiplier;

          if (this.userDeservesHandicapBonus(user.id)) {
            score *= this.handicapsMultiplier;
          }

          const alterUserScoreReason = dankTime.isRandom ? AlterUserScoreArgs.RANDOM_DANKTIME_REASON : AlterUserScoreArgs.NORMAL_DANKTIME_REASON;
          const alterUserScoreArgs = new AlterUserScoreArgs(user, Math.round(score), AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME,
            alterUserScoreReason, now.unix());
          this.alterUserScore(alterUserScoreArgs);
          user.called = true;

          if (this.firstNotifications) {
            output.push("👏 " + user.name + " was the first to score!");
          }
        } else if (!user.called) { // Else if user did not already call this time, award points.
          const score = Math.round(this.userDeservesHandicapBonus(user.id) ? dankTime.getPoints() * this.handicapsMultiplier : dankTime.getPoints());
          const alterUserScoreReason = dankTime.isRandom ? AlterUserScoreArgs.RANDOM_DANKTIME_REASON : AlterUserScoreArgs.NORMAL_DANKTIME_REASON;
          const alterUserScoreArgs = new AlterUserScoreArgs(user, score, AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME,
            alterUserScoreReason, now.unix());
          this.alterUserScore(alterUserScoreArgs);
          user.called = true;
        }
        return output;

      } else if (dankTime.getPoints() > subtractBy) {
        subtractBy = dankTime.getPoints();
      }
    }
    // If no match was found, punish the user.
    if (this.punishUntimelyDankTime) {
      const alterUserScoreArgs = new AlterUserScoreArgs(user, -subtractBy, AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME,
        AlterUserScoreArgs.UNTIMELY_DANKTIME_REASON, now.unix());
      this.alterUserScore(alterUserScoreArgs);
    }
    return output;
  }
}
