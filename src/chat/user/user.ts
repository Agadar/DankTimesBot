import { BasicUser } from "./basic-user";

export class User implements BasicUser {

  /**
   * Returns a new User parsed from a literal.
   */
  public static fromJSON(literal: BasicUser): User {
    return new User(literal.id, literal.name, literal.score, literal.lastScoreTimestamp);
  }

  /**
   * Compares two users using their score and name. Used for sorting collections.
   */
  public static compare(a: User, b: User): number {
    if (a.score > b.score) {
      return -1;
    }
    if (a.score < b.score) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  /**
   * Creates a new user object.
   * @param id The unique Telegram user's id.
   * @param name The Telegram user's name.
   * @param myScore The user's DankTimes score.
   * @param called Whether the user called the last dank time already.
   * @param myLastScoreChange The last change to the user's score.
   */
  constructor(
    public readonly id: number,
    public name: string,
    private myScore = 0,
    private myLastScoreTimestamp = 0,
    public called = false,
    private myLastScoreChange = 0,
  ) {
    if (this.myScore % 1 !== 0 || this.myScore < 0) {
      throw new RangeError("The score should be a whole, positive number!");
    }
    if (this.myLastScoreTimestamp % 1 !== 0) {
      throw new RangeError("The last score timestamp should be a whole number!");
    }
    if (this.myLastScoreChange % 1 !== 0) {
      throw new RangeError("The last score change should be a whole number!");
    }
  }

  public get lastScoreTimestamp(): number {
    return this.myLastScoreTimestamp;
  }

  /**
   * Gets the user's DankTimes score.
   */
  public get score(): number {
    return this.myScore;
  }

  /**
   * Gets the last change to the user's score.
   */
  public get lastScoreChange(): number {
    return this.myLastScoreChange;
  }

/**
 * NOTE: Plugins should not use this directly, as using this directly means no
 * user score events are fired for other plugins to listen to! Use the available
 * methods in Chat instead.
 *
 * Adds an amount to the user's DankTimes score.
 *
 * @param amount The amount to change the score with.
 * @param timestamp Optional timestamp of the score change. Used for hardmode punishment.
 * @returns The actual number with which the user's score was altered after corrections.
 */
  public alterScore(amount: number, timestamp?: number): number {
    amount = Math.max(Math.round(amount), -this.myScore);
    this.myScore += amount;
    this.myLastScoreChange += amount;

    if (amount > 0 && timestamp && timestamp > this.myLastScoreTimestamp) {
      this.myLastScoreTimestamp = timestamp;
    }
    return amount;
  }

  /**
   * Resets the DankTimes score.
   */
  public resetScore(): void {
    this.myScore = 0;
    this.myLastScoreChange = 0;
    this.called = false;
  }

  /**
   * Resets the last change to the user's score.
   */
  public resetLastScoreChange(): void {
    this.myLastScoreChange = 0;
  }

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): BasicUser {
    return {
      id: this.id, lastScoreTimestamp: this.lastScoreTimestamp, name: this.name, score: this.myScore,
    };
  }
}
