import { BasicUser } from "../../../chat/user/basic-user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the User Score Changed event.
 * Contains user and delta score.
 */
export class UserScoreChangedPluginEventArguments extends PluginEventArguments {
  /**
   * User that changed score.
   */
  public readonly user: BasicUser;
  /**
   * Change in score.
   */
  public readonly changeInScore: number;

  /**
   * Constructor.
   * @param user User that changed score.
   * @param changeInScore Delta score.
   */
  constructor(user: BasicUser, changeInScore: number) {
    super();
    this.user = user;
    this.changeInScore = changeInScore;
  }
}
