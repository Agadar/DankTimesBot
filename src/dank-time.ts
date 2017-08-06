export type DankTimeLiteral = { hour: number, minute: number, texts: string[], points: number };

/**
 * Represents a dank time.
 */
export class DankTime {

  private _points: number;

  /**
   * Creates a new dank time object.
   * @param hour The hour at which points can be scored.
   * @param minute The minute at which points can be scored.
   * @param texts The texts to shout at the hour:minute to score points.
   * @param points The amount of points to reward or confiscate.
   */
  constructor(public readonly hour: number, public readonly minute: number, public readonly texts: string[], points = 1) {
    if (this.hour % 1 !== 0 || this.hour < 0 || this.hour > 23) {
      throw TypeError('The hour must be a whole number between 0 and 23!');
    }
    if (this.minute % 1 !== 0 || this.minute < 0 || this.minute > 59) {
      throw TypeError('The minute must be a whole number between 0 and 59!');
    }
    if (this.texts.length < 1) {
      throw TypeError('The texts must be a string array containing at least one item!');
    }
    this.points = points;
  }

  /**
   * Sets the points.
   */
  public set points(points: number) {
    if (points % 1 !== 0 || points < 1 || points > 100) {
      throw TypeError('The points must be a whole number between 1 and 100!');
    }
    this._points = points;
  }

  /**
   * Gets the points.
   */
  public get points(): number {
    return this._points;
  };

  /**
   * Checks whether this instance contains the text (case-insensitive).
   * @returns True if this instance contains the text, otherwise false.
   */
  public hasText(text: string): boolean {
    text = text.toUpperCase();
    for (let text2 of this.texts) {
      if (text2.toUpperCase() === text) {
        return true;
      }
    }
    return false;
  };

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): DankTimeLiteral {
    return { hour: this.hour, minute: this.minute, texts: this.texts, points: this.points };
  };

  /**
   * Returns a new DankTime parsed from a literal.
   */
  public static fromJSON(literal: DankTimeLiteral): DankTime {
    return new DankTime(literal.hour, literal.minute, literal.texts, literal.points);
  };

  /**
   * Compares two dank times using their hour and minute. Used for sorting collections.
   */
  public static compare(a: DankTime, b: DankTime) {
    if (a.hour < b.hour) {
      return -1;
    }
    if (a.hour > b.hour) {
      return 1;
    }
    if (a.minute < b.minute) {
      return -1;
    }
    if (a.minute > b.minute) {
      return 1;
    }
    return 0;
  };
}