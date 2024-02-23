import { Chat } from "../../../chat/chat";
import { User } from "../../../chat/user/user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event arguments for the event fired BEFORE a user's score is changed.
 * Allows altering the amount with which a user's score is about to be changed.
 */
export class PreUserScoreChangedEventArguments extends PluginEventArguments {

    /**
   * Chat in which the score change will take place.
   */
    public readonly chat: Chat;
    /**
   * User that will change score.
   */
    public readonly user: User;
    /**
   * Change in score.
   */
    public get changeInScore(): number {
        return this.myChangeInScore;
    }

    public set changeInScore(newChangeInScore: number) {
        if (isNaN(newChangeInScore)) {
            console.error(`Failed to set new score change for source '${this.nameOfOriginPlugin}' for reason '${this.reason}': not a number`);
        } else if (this.isImmutable) {
            console.warn(`Cannot change the value for an immutable event from source '${this.nameOfOriginPlugin}' with reason '${this.reason}'.`);
        } else {
            this.myChangeInScore = newChangeInScore;
        }
    }

    /**
     * Indicates if the event is immutable.
     */
    public get immutable(): boolean {
        return this.isImmutable;
    }

    private isImmutable = false;
    private myChangeInScore = 0;

    /**
   * Constructor.
   * @param chat Chat in which the score change will take place.
   * @param user User that will change score.
   * @param changeInScore Delta score.
   * @param reason The reason for the score change, e.g. 'random.danktime' or 'hardcoremode.punishment'.
   * @param nameOfOriginPlugin The name of the plugin that is causing the score change, or empty if it is
   * not being caused by a plugin.
   * @param immutable Disallows the score delta to be changed.
   */
    constructor(chat: Chat, user: User, changeInScore: number, reason: string, nameOfOriginPlugin: string, immutable: boolean) {
        super(nameOfOriginPlugin, reason);
        this.chat = chat;
        this.user = user;
        this.changeInScore = changeInScore;
        this.isImmutable = immutable;
    }
}
