import { Chat } from "../../../chat/chat";
import { User } from "../../../chat/user/user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the User Score Changed event.
 * Contains chat, user, and delta score.
 */
export class UserScoreChangedEventArguments extends PluginEventArguments {

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
