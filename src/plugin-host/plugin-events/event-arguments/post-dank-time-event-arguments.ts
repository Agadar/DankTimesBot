import { Chat } from "../../../chat/chat";
import { User } from "../../../chat/user/user";
import { DankTime } from "../../../dank-time/dank-time";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the PostDankTime event.
 */
export class PostDankTimeEventArguments extends PluginEventArguments {

  /**
   * The chat in which the danktime occured.
   */
  public readonly chat: Chat;
  /**
   * The danktime that occured.
   */
  public readonly dankTime: DankTime;
  /**
   * The users that scored on this dank time, in order of scoring.
   * If empty, that means no user scored.
   */
  public readonly users: User[];

  /**
   * Constructor.
   * @param chat The chat in which the danktime occured.
   * @param dankTime The danktime that occured.
   * @param users The users that scored on this dank time, in order of scoring.
   */
  constructor(chat: Chat, dankTime: DankTime, users: User[]) {
    super();
    this.chat = chat;
    this.dankTime = dankTime;
    this.users = users;
  }
}
