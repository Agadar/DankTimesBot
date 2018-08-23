import { Chat } from "../../../chat/chat";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the Pre / Post message.
 * Contains the chat and the message text.
 */
export class PrePostMessagePluginEventArguments extends PluginEventArguments {

  /**
   * The chat in which the message is being posted.
   */
  public readonly chat: Chat;
  /**
   * Raw message going into / coming out of the Dank Times Bot process.
   */
  public readonly message: string;

  /**
   * Constructor.
   * @param chat The chat in which the message is being posted.
   * @param message Raw Telegram message.
   */
  constructor(chat: Chat, message: string) {
    super();
    this.chat = chat;
    this.message = message;
  }
}
