import { User } from "./user/user";

/**
 * Arguments for altering a user's score.
 */
export class AlterUserScoreArgs {

    public static readonly RANDOM_DANKTIME_REASON: string = "random.danktime";
    public static readonly NORMAL_DANKTIME_REASON: string = "normal.danktime";
    public static readonly UNTIMELY_DANKTIME_REASON: string = "untimely.danktime";
    public static readonly HARDCOREMODE_PUNISHMENT_REASON: string = "hardcoremode.punishment";

    public static readonly DANKTIMESBOT_ORIGIN_NAME: string = "";

    /**
     * Constructs new args.
     *
     * @param user The user to change the score of.
     * @param amount The amount to change the score with.
     * @param nameOfOriginPlugin The name of the plugin that is causing the score change, or empty if it is
     * not being caused by a plugin.
     * @param reason The reason for the score change, e.g. 'random.danktime' or 'hardcoremode.punishment'.
     * @param timestamp Optional timestamp of the score change. Used for hardmode punishment.
     */
    constructor(
        public readonly user: User,
        public readonly amount: number,
        public readonly nameOfOriginPlugin: string,
        public readonly reason: string,
        public readonly timestamp?: number,
    ) {}
}
