export type UserLiteral = { id: number, name: string, score: number, called: boolean, lastScoreChange: number };

/**
 * Represents a Telegram user.
 */
export class User {

  /**
   * Creates a new user object.
   * @param id The unique Telegram user's id.
   * @param name The Telegram user's name.
   * @param myScore The user's DankTimes score.
   * @param called Whether the user called the last dank time already.
   * @param myLastScoreChange The last change to the user's score.
   */
  constructor(public readonly id: number, public name: string, private myScore = 0, public called = false, private myLastScoreChange = 0) {
    this.myScore = Math.round(this.myScore);
    this.myLastScoreChange = Math.round(this.myLastScoreChange);
  }

  /**
   * Gets the user's DankTimes score.
   */
  public get score(): number {
    return this.myScore;
  };

  /**
   * Gets the last change to the user's score.
   */
  public get lastScoreChange(): number {
    return this.myLastScoreChange;
  };

  /**
   * Adds an amount to the user's DankTimes score.
   */
  public addToScore(amount: number): void {
    amount = Math.round(amount);
    this.myScore += amount;
    this.myLastScoreChange += amount;
  };

  /**
   * Resets the DankTimes score.
   */
  public resetScore(): void {
    this.myScore = 0;
    this.myLastScoreChange = 0;
    this.called = false;
  };

  /**
   * Resets the last change to the user's score.
   */
  public resetLastScoreChange(): void {
    this.myLastScoreChange = 0;
  };

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): UserLiteral {
    return {
      id: this.id, name: this.name, score: this.myScore,
      called: this.called, lastScoreChange: this.myLastScoreChange
    };
  };

  /**
   * Returns a new User parsed from a literal.
   */
  public static fromJSON(literal: UserLiteral): User {
    return new User(literal.id, literal.name, literal.score, literal.called, literal.lastScoreChange);
  };

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
  };
};
