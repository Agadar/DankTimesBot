import { Chat } from "../../../chat/chat";
import { User } from "../../../chat/user/user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event arguments for the event fired BEFORE a user's score is changed.
 * Allows altering the amount with which a user's score is about to be changed.
 */
export class PreUserScoreChangedEventArguments extends PluginEventArguments {

  /**
   * The name of the plugin that is causing the score change, or empty if it is
   * not being caused by a plugin.
   */
  public readonly nameOfOriginPlugin: string;
  /**
   * The reason for the score change, e.g. 'random.danktime' or 'hardcoremode.punishment'.
   */
  public readonly reason: string;
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
  public changeInScore: number;

  /**
   * Constructor.
   * @param chat Chat in which the score change will take place.
   * @param user User that will change score.
   * @param changeInScore Delta score.
   * @param reason The reason for the score change, e.g. 'random.danktime' or 'hardcoremode.punishment'.
   * @param nameOfOriginPlugin The name of the plugin that is causing the score change, or empty if it is
   * not being caused by a plugin.
   */
  constructor(chat: Chat, user: User, changeInScore: number, reason: string, nameOfOriginPlugin: string) {
    super();
    this.chat = chat;
    this.user = user;
    this.changeInScore = changeInScore;
    this.reason = reason;
    this.nameOfOriginPlugin = nameOfOriginPlugin;
  }
}
