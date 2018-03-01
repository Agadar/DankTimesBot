import { Chat } from "../../chat/chat";
import { Leaderboard } from "../../chat/leaderboard/leaderboard";
import { User } from "../../chat/user/user";
import { DankTime } from "../../dank-time/dank-time";

/**
 * Plugin to Chat interface.
 * Used by plugins to request certain data from their
 * respective chats.
 */
export class ChatServices {
  /**
   * Instance of the Chat this ChatServices
   * belongs to.
   */
  private readonly instance: () => Chat;

  /**
   * Constructor.
   * @param instance Chat this Services belongs to.
   */
  constructor(instance: Chat) {
    this.instance = () => instance;
  }

  /**
   * Get DankTimes for chat.
   */
  public dankTimes(): DankTime[] {
    return Array.from(this.instance().dankTimes);
  }

  /**
   * Get Users in chat.
   */
  public users(): User[] {
    return Array.from(this.instance().sortedUsers());
  }

  /**
   * Get actual leaderboard from chat.
   */
  public Leaderboard(): Leaderboard {
    return new Leaderboard(this.users());
  }
}
