import { BotCommand } from "../bot-commands/bot-command";
import { ITelegramClientListener } from "./i-telegram-client-listener";

export interface ITelegramClient {

  readonly commands: Map<string, BotCommand>;

  executeCommand(msg: any, match: string[], botCommand: BotCommand): Promise<string>;

  setOnAnyText(action: ((msg: any, match: string[]) => string[])): void;

  registerCommand(command: BotCommand): Promise<void>;

  sendMessage(chatId: number, htmlMessage: string, replyToMessageId: number, forceReply: boolean): Promise<any>;

  deleteMessage(chatId: number, messageId: number): Promise<any>;

  /**
   * Subscribes to this telegram client to receive updates.
   */
  subscribe(subscriber: ITelegramClientListener): void;
}
