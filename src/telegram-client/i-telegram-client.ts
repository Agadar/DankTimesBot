import TelegramBot from "node-telegram-bot-api";
import { ITelegramClientListener } from "./i-telegram-client-listener";

/**
 * The Telegram Client that communicates with the API via the 'node-telegram-bot-api' library.
 */
export interface ITelegramClient {

  /**
   * Gets the bot's username.
   * @return The bot's username.
   */
  getBotUsername(): Promise<string>;

  /**
   * Sets the action to do on ANY incoming text.
   * @param action The action to execute on any text.
   */
  setOnAnyText(action: ((message: TelegramBot.Message) => string[])): void;

  /**
   * Sets the action to do on the specified incoming regex match.
   * @param regExp The regex to match.
   * @param action The action to execute.
   */
  setOnRegex(regExp: RegExp, action: (msg: TelegramBot.Message, match: RegExpExecArray | null) => void): void;

  /**
   * Sends a message to the Telegram Bot API.
   * @param chatId The id of the chat to send a message to.
   * @param htmlMessage The HTML message to send.
   * @param replyToMessageId The (optional) id of the message to reply to.
   * @param forceReply Whether to force the replied-to or tagged user to reply to this message. False by default.
   */
  sendMessage(chatId: number, htmlMessage: string, replyToMessageId?: number, forceReply?: boolean): Promise<void | TelegramBot.Message>;

  /**
   * Deletes a message via the Telegram Bot API.
   * @param chatId The id of the chat to delete a message in.
   * @param messageId The id of the message to delete.
   */
  deleteMessage(chatId: number, messageId: number): Promise<boolean | void>;

  /**
   * Subsribes the supplied listener to events fired by this client.
   * @param subscriber The listener.
   */
  subscribe(subscriber: ITelegramClientListener): void;

  /**
   * Gets the administrators of the chat with the supplied id.
   * @param chatId The id of the chat to get the administrators of.
   * @return The administrators of the specified chat.
   */
  getChatAdministrators(chatId: number): Promise<TelegramBot.ChatMember[]>;
}
