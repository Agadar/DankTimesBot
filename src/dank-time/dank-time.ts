import { BasicDankTime } from "./basic-dank-time";

export class DankTime {

  /**
   * Returns a new DankTime parsed from a literal.
   */
  public static fromJSON(literal: BasicDankTime): DankTime {
    return new DankTime(literal.hour, literal.minute, literal.texts, () => literal.points);
  }

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
  }

  public readonly texts = new Array<string>();
  private myPoints: () => number;

  /**
   * Creates a new dank time object.
   * @param hour The hour at which points can be scored.
   * @param minute The minute at which points can be scored.
   * @param texts The texts to shout at the hour:minute to score points.
   * @param points The amount of points to reward or confiscate.
   */
  constructor(public readonly hour: number, public readonly minute: number, texts: string[], points: () => number) {
    if (this.hour % 1 !== 0 || this.hour < 0 || this.hour > 23) {
      throw new RangeError("The hour must be a whole number between 0 and 23!");
    }
    if (this.minute % 1 !== 0 || this.minute < 0 || this.minute > 59) {
      throw new RangeError("The minute must be a whole number between 0 and 59!");
    }
    if (texts.length < 1) {
      throw new RangeError("The texts must be a string array containing at least one item!");
    }
    texts.forEach((text) => {
      if (this.texts.indexOf(text) === -1) {
        this.texts.push(text);
      }
    });
    this.setPoints(points);
  }

  /**
   * Sets the points.
   */
  public setPoints(points: () => number) {
    const pointsValue = points();
    if (pointsValue % 1 !== 0 || pointsValue < 1 || pointsValue > 10000) {
      throw new RangeError("The points must be a whole number between 1 and 10000!");
    }
    this.myPoints = points;
  }

  /**
   * Gets the points.
   */
  public getPoints(): number {
    return this.myPoints();
  }

  /**
   * Checks whether this instance contains the text (case-insensitive).
   * @returns True if this instance contains the text, otherwise false.
   */
  public hasText(text: string): boolean {
    text = text.toUpperCase();
    for (const text2 of this.texts) {
      if (text2.toUpperCase() === text) {
        return true;
      }
    }
    return false;
  }

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): BasicDankTime {
    return { hour: this.hour, minute: this.minute, texts: this.texts, points: this.myPoints() };
  }
}
