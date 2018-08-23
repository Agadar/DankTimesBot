import { Chat } from "../../../chat/chat";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Leaderboard Reset Plugin Event Arguments.
 * Contains chat that has been reset.
 */
export class LeaderboardResetPluginEventArguments extends PluginEventArguments {
  
  /**
   * The chat that was reset.
   */
  public readonly chat: Chat;

  /**
   * Constructor.
   * @param chat Chat that was reset.
   */
  constructor(chat: Chat) {
    super();
    this.chat = chat;
  }
}
