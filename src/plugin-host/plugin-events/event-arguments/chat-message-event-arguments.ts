import { Chat } from "../../../chat/chat";
import { User } from "../../../chat/user/user";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the ChatMessage event.
 */
export class ChatMessageEventArguments extends PluginEventArguments {

  /**
   * The chat in which the message is being posted.
   */
  public readonly chat: Chat;
  /**
   * The user that posted the chat message.
   */
  public readonly user: User;
  /**
   * Raw message object going into / coming out of the Dank Times Bot process.
   */
  public readonly msg: any;

  /**
   * The replies being prepared by the bot to send back. May be altered/added to by plugins.
   */
  public botReplies: string[];

  /**
   * Constructor.
   * @param chat The chat in which the message is being posted.
   * @param user The user that posted the chat message.
   * @param msg Raw Telegram message object.
   * @param botReplies The replies being prepared by the bot to send back.
   */
  constructor(chat: Chat, user: User, msg: any, botReplies: string[]) {
    super();
    this.chat = chat;
    this.user = user;
    this.msg = msg;
    this.botReplies = botReplies;
  }
}
