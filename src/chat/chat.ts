import * as moment from 'moment-timezone';
import * as util from '../util/util';
import { DankTime } from '../dank-time/dank-time';
import { User } from '../user/user';
import { Leaderboard } from '../leaderboard/leaderboard';
import { BasicChat } from "./basic-chat";

export class Chat {

  public awaitingResetConfirmation = -1;

  private _id: number;
  private _timezone: string;
  private _lastHour: number;
  private _lastMinute: number;
  private _numberOfRandomTimes: number;
  private _pointsPerRandomTime: number;
  private _multiplier: number;
  private _lastLeaderboard?: Leaderboard = undefined;

  /**
   * Creates a new Chat object.
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
  constructor(id: number, timezone = 'Europe/Amsterdam', public running = false, numberOfRandomTimes = 1, pointsPerRandomTime = 10,
    lastHour = 0, lastMinute = 0, private readonly users = new Map<number, User>(), public readonly dankTimes = new Array<DankTime>(),
    public randomDankTimes = new Array<DankTime>(), public notifications = true, multiplier = 2, public autoLeaderboards = true,
    public firstNotifications = true, public hardcoreMode = false) {

    this.id = id;
    this.timezone = timezone;
    this.lastHour = lastHour;
    this.lastMinute = lastMinute;
    this.numberOfRandomTimes = numberOfRandomTimes;
    this.pointsPerRandomTime = pointsPerRandomTime;
    this.multiplier = multiplier;
  }

  /**
   * Returns a new Chat parsed from a literal.
   */
  public static fromJSON(literal: BasicChat): Chat {

    // For backwards compatibility with v.1.1.0.
    if (!literal.multiplier) {
      literal.multiplier = 2;
    }
    if (!literal.autoLeaderboards) {
      literal.autoLeaderboards = true;
    }
    if (!literal.firstNotifications) {
      literal.firstNotifications = true;
    }

    const dankTimes = new Array<DankTime>();
    literal.dankTimes.forEach(dankTime => dankTimes.push(DankTime.fromJSON(dankTime)));

    const users = new Map();
    literal.users.forEach(user => users.set(user.id, User.fromJSON(user)));

    return new Chat(literal.id, literal.timezone, literal.running, literal.numberOfRandomTimes, literal.pointsPerRandomTime,
      literal.lastHour, literal.lastMinute, users, dankTimes, [], literal.notifications, literal.multiplier,
      literal.autoLeaderboards, literal.firstNotifications, literal.hardcoreMode);
  };

  public set id(id: number) {
    if (id % 1 !== 0) {
      throw new RangeError('The id must be a whole number!');
    }
    this._id = id;
  }

  public get id(): number {
    return this._id;
  }

  public set timezone(timezone: string) {
    if (moment.tz.zone(timezone) === null) {
      throw new RangeError('Invalid timezone! Examples: \'Europe/Amsterdam\', \'UTC\'.');
    }
    this._timezone = timezone;
  }

  public get timezone(): string {
    return this._timezone;
  }

  public set lastHour(lastHour: number) {
    if (lastHour < 0 || lastHour > 23 || lastHour % 1 !== 0) {
      throw new RangeError('The hour must be a whole number between 0 and 23!');
    }
    this._lastHour = lastHour;
  }

  public get lastHour(): number {
    return this._lastHour;
  }

  public set lastMinute(lastMinute: number) {
    if (lastMinute < 0 || lastMinute > 59 || lastMinute % 1 !== 0) {
      throw new RangeError('The minute must be a whole number between 0 and 59!');
    }
    this._lastMinute = lastMinute;
  }

  public get lastMinute(): number {
    return this._lastMinute;
  }

  public set numberOfRandomTimes(numberOfRandomTimes: number) {
    if (numberOfRandomTimes < 0 || numberOfRandomTimes > 24 || numberOfRandomTimes % 1 !== 0) {
      throw new RangeError('The number of times must be a whole number between 0 and 24!');
    }
    this._numberOfRandomTimes = numberOfRandomTimes;
    this.randomDankTimes.splice(numberOfRandomTimes)
  }

  public get numberOfRandomTimes(): number {
    return this._numberOfRandomTimes;
  }

  public set multiplier(multiplier: number) {
    if (multiplier < 1 || multiplier > 10) {
      throw new RangeError('The multiplier must be a number between 1 and 10!');
    }
    this._multiplier = multiplier;
  }

  public get multiplier(): number {
    return this._multiplier;
  }

  public set pointsPerRandomTime(pointsPerRandomTime: number) {
    if (pointsPerRandomTime < 1 || pointsPerRandomTime > 100 || pointsPerRandomTime % 1 !== 0) {
      throw new RangeError('The points must be a whole number between 1 and 100!');
    }
    this._pointsPerRandomTime = pointsPerRandomTime;
  }

  public get pointsPerRandomTime(): number {
    return this._pointsPerRandomTime;
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
  };

  /**
   * Adds a user to this chat.
   */
  public addUser(user: User): void {
    this.users.set(user.id, user);
  };

  /**
   * Gets an array of the users, sorted by scores.
   */
  public sortedUsers(): User[] {
    const usersArr = new Array<User>();
    this.users.forEach(user => usersArr.push(user));
    usersArr.sort(User.compare);
    return usersArr;
  };

  /**
   * Generates new random dank times for this chat, clearing old ones.
   */
  public generateRandomDankTimes(): DankTime[] {
    this.randomDankTimes = new Array<DankTime>();
    for (let i = 0; i < this._numberOfRandomTimes; i++) {
      const now = moment().tz(this.timezone);
      now.add(now.hours() + Math.floor(Math.random() * 23), 'hours');
      now.minutes(Math.floor(Math.random() * 59));
      const text = util.padNumber(now.hours().toString()) + util.padNumber(now.minutes.toString());
      this.randomDankTimes.push(new DankTime(now.hours(), now.minutes(), [text], this._pointsPerRandomTime));
    }
    return this.randomDankTimes;
  };

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): BasicChat {
    return {
      id: this._id, timezone: this._timezone, running: this.running, numberOfRandomTimes: this._numberOfRandomTimes,
      pointsPerRandomTime: this._pointsPerRandomTime, lastHour: this._lastHour, lastMinute: this._lastMinute, users: this.sortedUsers(),
      dankTimes: this.dankTimes, notifications: this.notifications, multiplier: this._multiplier,
      autoLeaderboards: this.autoLeaderboards, firstNotifications: this.firstNotifications, hardcoreMode: this.hardcoreMode
    };
  };

  /**
   * Processes a message, awarding or punishing points etc. where applicable.
   * @returns A reply, or nothing if no reply is suitable/needed.
   */
  public processMessage(userId: number, userName: string, msgText: string, msgUnixTime: number): string {

    // Ignore the message if it was sent more than 1 minute ago.
    const now = moment().tz(this.timezone);
    if (now.unix() - msgUnixTime >= 60) {
      return '';
    }
    msgText = util.cleanText(msgText);

    // If we are awaiting reset confirmation...
    if (this.awaitingResetConfirmation === userId) {
      this.awaitingResetConfirmation = -1;
      if (msgText.toUpperCase() === 'YES') {
        const message = 'Leaderboard has been reset!\n\n' + this.generateLeaderboard(true);
        this.users.forEach(user => user.resetScore());
        return message;
      }
    }

    // If this chat isn't running, don't check anything else.
    if (!this.running) {
      return '';
    }

    // Gather dank times from the sent text, returning if none was found.
    const dankTimesByText = this.getDankTimesByText(msgText);
    if (dankTimesByText.length < 1) {
      return '';
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
    for (let dankTime of dankTimesByText) {
      if (now.hours() === dankTime.hour && now.minutes() === dankTime.minute) {

        // If cache needs resetting, do so and award DOUBLE points to the calling user.
        if (this.lastHour !== dankTime.hour || this._lastMinute !== dankTime.minute) {
          this.users.forEach(user => user.called = false);
          this.lastHour = dankTime.hour;
          this.lastMinute = dankTime.minute;
          user.addToScore(Math.round(dankTime.points * this._multiplier));
          user.called = true;
          if (this.firstNotifications) {
            return user.name + ' was the first to score!';
          }
        } else if (user.called) { // Else if user already called this time, remove points.
          user.addToScore(-dankTime.points);
        } else {  // Else, award point.
          user.addToScore(dankTime.points);
          user.called = true;
        }
        return '';
      } else if (dankTime.points > subtractBy) {
        subtractBy = dankTime.points;
      }
    }
    // If no match was found, punish the user.
    user.addToScore(-subtractBy);
    return '';
  };

  /**
   * Resets the scores of all the users.
   */
  public resetScores(): void {
    this.users.forEach(user => user.resetScore());
  };

  /**
   * Removes the dank time with the specified hour and minute.
   * @returns Whether a dank time was found and removed.
   */
  public removeDankTime(hour: number, minute: number): boolean {
    const dankTime = this.getDankTime(hour, minute);
    if (dankTime) {
      this.dankTimes.splice(this.dankTimes.indexOf(dankTime));
      return true;
    }
    return false;
  };

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
    const oldLeaderboard = this._lastLeaderboard;
    this._lastLeaderboard = new Leaderboard(Array.from(this.users.values()));
    let leaderboard = '<b>--- ' + (final ? 'FINAL ' : '') + 'LEADERBOARD ---</b>\n';
    leaderboard += this._lastLeaderboard.toString(oldLeaderboard);

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
    for (let dankTime of this.dankTimes) {
      if (dankTime.hour === hour && dankTime.minute === minute) {
        return dankTime;
      }
    }
    return null;
  };

  public hardcoreModeCheck(timestamp: number) {
    if (this.hardcoreMode) {
      const day = 24 * 60 * 60;
      const punishBy = 10;
      this.users.forEach(user => {
        if (timestamp - user.lastScoreTimestamp >= day && user.score - punishBy >= 0) {
          user.addToScore(-punishBy);
        }
      });
    }
  }

  /**
   * Gets both normal and random dank times that have the specified text.
   */
  private getDankTimesByText(text: string): DankTime[] {
    const found = [];
    for (let dankTime of this.dankTimes.concat(this.randomDankTimes)) {
      if (dankTime.hasText(text)) {
        found.push(dankTime);
      }
    }
    return found;
  };
}
