import { Chat } from "../../../chat/chat";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Leaderboard Post Plugin Event Arguments.
 */
export class LeaderboardPostPluginEventArguments extends PluginEventArguments {

  /**
   * The chat in which the leaderboard is about to be posted.
   */
  public readonly chat: Chat;

  /**
   * Reference to the generated leaderboard text, open for editing.
   */
  public readonly leaderboardText: string[];

  /**
   * Constructor.
   * @param chat The chat in which the leaderboard is about to be posted.
   * @param leaderboardText Reference to the generated leaderboard text.
   */
  constructor(chat: Chat, leaderboardText: string[]) {
    super();
    this.chat = chat;
    this.leaderboardText = leaderboardText;
  }
}
