import { BasicUser } from "../../../chat/user/basic-user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the User Score Changed event.
 * Contains user and delta score.
 */
export class UserScoreChangedPluginEventArguments extends PluginEventArguments
{
  /**
   * User that changed score.
   */
  public readonly User: BasicUser;
  /**
   * Change in score.
   */
  public readonly ChangeInScore: number;

  /**
   * Constructor.
   * @param _user User that changed score.
   * @param _changeInScore Delta score.
   */
  constructor(_user: BasicUser, _changeInScore: number)
  {
    super();
    this.User = _user;
    this.ChangeInScore = _changeInScore;
  }
}