import { DankTime } from "../dank-time/dank-time";
import { IUtil } from "../util/i-util";
import { BasicChat } from "./basic-chat";
import { Leaderboard } from "./leaderboard/leaderboard";
import { User } from "./user/user";

const handicapMultiplier = 1.5;
const bottomPartThatHasHandicap = 0.25;

const punishByFraction = 0.1;
const punishByPoints = 10;

export class Chat {

  public awaitingResetConfirmation = -1;

  private myId: number;
  private myTimezone: string;
  private myLastHour: number;
  private myLastMinute: number;
  private myNumberOfRandomTimes: number;
  private myPointsPerRandomTime: number;
  private myMultiplier: number;
  private myLastLeaderboard?: Leaderboard = undefined;

  /**
   * Creates a new Chat object.
   * @param moment Reference to timezone import.
   * @param id The chat's unique Telegram id.
   * @param timezone The timezone the users are in.
   * @param running Whether this bot is running for this chat.
   * @param numberOfRandomTimes The number of randomly generated dank times to generate each day.
   * @param pointsPerRandomTime The number of points each randomly generated dank time is worth.
   * @param lastHour The hour of the last valid dank time being proclaimed.
   * @param lastMinute The minute of the last valid dank time being proclaimed.
   * @param users A map with the users, indexed by user id's.
   * @param dankTimes The dank times known in this chat.
   * @param randomDankTimes The daily randomly generated dank times in this chat.
   * @param notifications Whether this chat automatically sends notifications for dank times.
   * @param multiplier The multiplier applied to the score of the first user to score.
   * @param autoLeaderboards Whether this chat automatically posts leaderboards after dank times occured.
   * @param firstNotifications Whether this chat announces the first user to score.
   * @param hardcoreMode Whether this chat punishes users that haven't scored in the last 24 hours.
   */
  constructor(
    private readonly moment: any,
    private readonly util: IUtil,
    id: number,
    timezone = "Europe/Amsterdam",
    public running = false,
    numberOfRandomTimes = 1,
    pointsPerRandomTime = 10,
    lastHour = 0,
    lastMinute = 0,
    private readonly users = new Map<number, User>(),
    public readonly dankTimes = new Array<DankTime>(),
    public randomDankTimes = new Array<DankTime>(),
    public notifications = true,
    multiplier = 2,
    public autoLeaderboards = true,
    public firstNotifications = true,
    public hardcoreMode = false,
    public handicaps = true) {

    this.id = id;
    this.timezone = timezone;
    this.lastHour = lastHour;
    this.lastMinute = lastMinute;
    this.numberOfRandomTimes = numberOfRandomTimes;
    this.pointsPerRandomTime = pointsPerRandomTime;
    this.multiplier = multiplier;
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

  public set timezone(timezone: string) {
    const momentTimezone = this.moment.tz.zone(timezone);

    if (momentTimezone === null) {
      throw new RangeError("Invalid timezone! Examples: 'Europe/Amsterdam', 'UTC'.");
    }
    this.myTimezone = momentTimezone.name;
  }

  public get timezone(): string {
    return this.myTimezone;
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

  public set numberOfRandomTimes(numberOfRandomTimes: number) {
    if (numberOfRandomTimes < 0 || numberOfRandomTimes > 24 || numberOfRandomTimes % 1 !== 0) {
      throw new RangeError("The number of times must be a whole number between 0 and 24!");
    }
    this.myNumberOfRandomTimes = numberOfRandomTimes;
    this.randomDankTimes.splice(numberOfRandomTimes);
  }

  public get numberOfRandomTimes(): number {
    return this.myNumberOfRandomTimes;
  }

  public set multiplier(multiplier: number) {
    if (multiplier < 1 || multiplier > 10) {
      throw new RangeError("The multiplier must be a number between 1 and 10!");
    }
    this.myMultiplier = multiplier;
  }

  public get multiplier(): number {
    return this.myMultiplier;
  }

  public set pointsPerRandomTime(pointsPerRandomTime: number) {
    if (pointsPerRandomTime < 1 || pointsPerRandomTime > 100 || pointsPerRandomTime % 1 !== 0) {
      throw new RangeError("The points must be a whole number between 1 and 100!");
    }
    this.myPointsPerRandomTime = pointsPerRandomTime;
  }

  public get pointsPerRandomTime(): number {
    return this.myPointsPerRandomTime;
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
   * Adds a user to this chat.
   */
  public addUser(user: User): void {
    this.users.set(user.id, user);
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

    for (let i = 0; i < this.myNumberOfRandomTimes; i++) {
      const now = this.moment().tz(this.timezone);

      now.add(Math.floor(Math.random() * 23), "hours");
      now.minutes(Math.floor(Math.random() * 59));

      if (!this.hourAndMinuteAlreadyRegistered(now.hours(), now.minutes())) {
        const text = this.util.padNumber(now.hours()) + this.util.padNumber(now.minutes());
        this.randomDankTimes.push(new DankTime(now.hours(), now.minutes(), [text], this.myPointsPerRandomTime));
      }
    }
    return this.randomDankTimes;
  }

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): BasicChat {
    return {
      autoLeaderboards: this.autoLeaderboards,
      dankTimes: this.dankTimes,
      firstNotifications: this.firstNotifications,
      handicaps: this.handicaps,
      hardcoreMode: this.hardcoreMode,
      id: this.myId,
      lastHour: this.myLastHour,
      lastMinute: this.myLastMinute,
      multiplier: this.myMultiplier,
      notifications: this.notifications,
      numberOfRandomTimes: this.myNumberOfRandomTimes,
      pointsPerRandomTime: this.myPointsPerRandomTime,
      running: this.running,
      timezone: this.myTimezone,
      users: this.sortedUsers(),
    };
  }

  /**
   * Processes a message, awarding or punishing points etc. where applicable.
   * @returns A reply, or nothing if no reply is suitable/needed.
   */
  public processMessage(userId: number, userName: string, msgText: string, msgUnixTime: number): string {

    // Ignore the message if it was sent more than 1 minute ago.
    const now = this.moment.tz(this.timezone);
    if (now.unix() - msgUnixTime >= 60) {
      return "";
    }
    msgText = this.util.cleanText(msgText);

    // If we are awaiting reset confirmation...
    if (this.awaitingResetConfirmation === userId) {
      this.awaitingResetConfirmation = -1;
      if (msgText.toUpperCase() === "YES") {
        const message = "Leaderboard has been reset!\n\n" + this.generateLeaderboard(true);
        this.users.forEach((user0) => user0.resetScore());
        return message;
      }
    }

    // If this chat isn't running, don't check anything else.
    if (!this.running) {
      return "";
    }

    // Gather dank times from the sent text, returning if none was found.
    const dankTimesByText = this.getDankTimesByText(msgText);
    if (dankTimesByText.length < 1) {
      return "";
    }

    // Get the player, creating him if he doesn't exist yet.
    if (!this.users.has(userId)) {
      this.users.set(userId, new User(userId, userName));
    }
    const user = this.users.get(userId) as User;

    // Update user name if needed.
    if (user.name !== userName) {
      user.name = userName;
    }
    let subtractBy = 0;

    for (const dankTime of dankTimesByText) {
      if (now.hours() === dankTime.hour && now.minutes() === dankTime.minute) {

        // If cache needs resetting, do so and award DOUBLE points to the calling user.
        if (this.lastHour !== dankTime.hour || this.myLastMinute !== dankTime.minute) {
          this.users.forEach((user0) => user0.called = false);
          this.lastHour = dankTime.hour;
          this.lastMinute = dankTime.minute;
          let score = dankTime.points * this.myMultiplier;

          if (this.userDeservesHandicapBonus(user.id)) {
            score *= handicapMultiplier;
          }
          user.addToScore(Math.round(score), now.unix());
          user.called = true;

          if (this.firstNotifications) {
            return "👏 " + user.name + " was the first to score!";
          }
        } else if (user.called) { // Else if user already called this time, remove points.
          user.addToScore(-dankTime.points, now.unix());
        } else {  // Else, award point.
          const score = Math.round(this.userDeservesHandicapBonus(user.id)
            ? dankTime.points * handicapMultiplier : dankTime.points);
          user.addToScore(score, now.unix());
          user.called = true;
        }
        return "";
      } else if (dankTime.points > subtractBy) {
        subtractBy = dankTime.points;
      }
    }
    // If no match was found, punish the user.
    user.addToScore(-subtractBy, now.unix());
    return "";
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
    return leaderboard;
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
    if (this.hardcoreMode) {
      const day = 24 * 60 * 60;
      this.users.forEach((user) => {
        if (timestamp - user.lastScoreTimestamp >= day && user.score > 0) {
          let punishBy = Math.round(user.score * punishByFraction);
          punishBy = Math.max(punishBy, punishByPoints);

          if (user.score - punishBy < 0) {
            punishBy = user.score;
          }
          user.addToScore(-punishBy, timestamp);
        }
      });
    }
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
    if (!this.handicaps) {
      return false;
    }
    const sortedUsers = this.sortedUsers();
    let noOfHandicapped = sortedUsers.length * bottomPartThatHasHandicap;
    noOfHandicapped = Math.round(noOfHandicapped);
    const handicapped = sortedUsers.slice(-noOfHandicapped);

    for (const entry of handicapped) {
      if (entry.id === userId) {
        return true;
      }
    }
    return false;
  }
}
