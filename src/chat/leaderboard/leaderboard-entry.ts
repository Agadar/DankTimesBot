import { User } from "../user/user";

export class LeaderboardEntry {

    /**
   * Compares two leaderboard entries using their score and name.
   */
    public static compare(a: LeaderboardEntry, b: LeaderboardEntry): number {
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

    public readonly id: number;
    public readonly name: string;
    public readonly avatar: string;
    public readonly score: number;
    public readonly lastScoreChange: number;

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.avatar = user.currentAvatar;
        this.score = user.score;
        this.lastScoreChange = user.lastScoreChange;
    }

    /**
   * Compares this leaderboard entry to another one, using their score and name.
   */
    public compare(other: LeaderboardEntry): number {
        return LeaderboardEntry.compare(this, other);
    }
}
