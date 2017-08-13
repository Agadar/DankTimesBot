import { User } from "../user/user";
import { LeaderboardEntry } from "./leaderboard-entry";

/**
 * Represents a leaderboard.
 */
export class Leaderboard {

  /**
   * Generates a specified number of arrow emoji's (up for positive, down for negative).
   */
  private static arrowEmojis(amount: number): string {
    let emojis = "";
    if (amount > 0) {
      for (let i = 0; i < amount; i++) {
        emojis += "⬆️";
      }
    } else {
      for (let i = 0; i > amount; i--) {
        emojis += "⬇️";
      }
    }
    return emojis;
  }

  public readonly entries = new Array<LeaderboardEntry>();

  /**
   * Constructs a new leaderboard from the supplied array of users.
   */
  constructor(users: User[] = []) {
    users.forEach((user) => {
      this.entries.push(new LeaderboardEntry(user));
    });
    this.entries.sort(LeaderboardEntry.compare);
  }

  /**
   * Adds a new user to this leaderboard.
   */
  public addEntry(user: User): void {
    this.entries.push(new LeaderboardEntry(user));
    this.entries.sort(LeaderboardEntry.compare);
  }

  /**
   * Returns a string representation of this leaderboard.
   * @param previous The previous leaderboard, or null.
   */
  public toString(previous?: Leaderboard): string {
    const positionChanges = previous ? this.calculatePositionChanges(previous) : new Map<number, number>();
    let leaderboard = "";
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const positionChange = positionChanges.get(entry.id);
      const arrowEmojis = Leaderboard.arrowEmojis(positionChange ? positionChange : 0);
      const scoreChange = entry.lastScoreChange > 0 ? `(+${entry.lastScoreChange})` : entry.lastScoreChange < 0
        ? `(${entry.lastScoreChange})` : "";
      leaderboard += `\n<b>${(i + 1)}.</b>    ${entry.name}    ${entry.score} ${scoreChange}    ${arrowEmojis}`;
    }
    return leaderboard;
  }

  /**
   * Gets the index of the entry that has the specified user id. If no such user exists, returns -1.
   */
  private indexOfEntryViaUserId(userId: number): number {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].id === userId) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Calculates the position changes by comparing this leaderboard to a previous one.
   * @returns The position changes, mapped to user id's.
   */
  private calculatePositionChanges(previousLeaderboard: Leaderboard): Map<number, number> {
    const positionChanges = new Map();
    for (let currentPosition = 0; currentPosition < this.entries.length; currentPosition++) {
      const currentEntry = this.entries[currentPosition];
      const oldPosition = previousLeaderboard.indexOfEntryViaUserId(currentEntry.id);
      const change = oldPosition - currentPosition;
      if (change > 0 || change < 0) {
        positionChanges.set(currentEntry.id, change);
      }
    }
    return positionChanges;
  }
}
