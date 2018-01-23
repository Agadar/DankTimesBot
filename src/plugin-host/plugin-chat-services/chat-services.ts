import { Chat } from "../../chat/chat";
import { Leaderboard } from "../../chat/leaderboard/leaderboard";
import { DankTime } from "../../dank-time/dank-time";
import { User } from "../../chat/user/user";

/**
 * Plugin to Chat interface.
 * Used by plugins to request certain data from their
 * respective chats.
 */
export class ChatServices 
{
  /**
   * Instance of the Chat this ChatServices
   * belongs to.
   */
  private readonly Instance: Chat;
  
  /**
   * Constructor.
   * @param _instance Chat this Services belongs to.
   */
  constructor(_instance: Chat)
  {
    this.Instance = _instance;
  }

  /**
   * Get DankTimes for chat.
   */
  public DankTimes(): DankTime[]
  {
    let _rTimes: DankTime[];

    _rTimes = Array.from(this.Instance.dankTimes);

    return _rTimes;
  }

  /**
   * Get Users in chat.
   */
  public Users(): User[]
  {
    let _rUsers: User[]; 
    _rUsers = Array.from(this.Instance.sortedUsers());
    return _rUsers;
  }

  /**
   * Get actual leaderboard from chat.
   */
  public Leaderboard(): Leaderboard
  {
    let _rLeaderboard: Leaderboard;
    _rLeaderboard = new Leaderboard(this.Users());
    return _rLeaderboard;
  }
}