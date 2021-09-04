import { Chat } from "../../../chat/chat";
import { User } from "../../../chat/user/user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event arguments for the event fired AFTER a user's score is changed.
 * Does NOT allow altering the amount with which a user's score is changed
 * because the change has already occured.
 */
export class PostUserScoreChangedEventArguments extends PluginEventArguments {

  /**
   * Chat in which the score change took place.
   */
  public readonly chat: Chat;
  /**
   * User that changed score.
   */
  public readonly user: User;
  /**
   * Change in score.
   */
  public readonly changeInScore: number;

  /**
   * Constructor.
   * @param chat Chat in which the score change took place.
   * @param user User that changed score.
   * @param changeInScore Delta score.
   */
  constructor(chat: Chat, user: User, changeInScore: number) {
    super();
    this.chat = chat;
    this.user = user;
    this.changeInScore = changeInScore;
  }
}
