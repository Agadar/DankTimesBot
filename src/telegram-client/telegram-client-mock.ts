import TelegramBot from "node-telegram-bot-api";
import { ITelegramClient } from "./i-telegram-client";
import { ITelegramClientListener } from "./i-telegram-client-listener";

export class TelegramClientMock implements ITelegramClient {

  public readonly botname = "testbot";

  public setOnAnyText(action: ((message: TelegramBot.Message) => string[])): void {
    // Don't do anything, this is a mock.
  }

  public async sendMessage(chatId: number, htmlMessage: string, replyToMessageId?: number, forceReply?: boolean): Promise<void | TelegramBot.Message> {
    // Don't do anything, this is a mock.
  }

  public subscribe(subscriber: ITelegramClientListener): void {
    // Don't do anything, this is a mock.
  }

  public async deleteMessage(chatId: number, messageId: number): Promise<boolean | void> {
    // Don't do anything, this is a mock.
  }

  public getBotUsername(): Promise<string> {
    return Promise.resolve("test");
  }

  public setOnRegex(regExp: RegExp, action: (msg: TelegramBot.Message, match: RegExpExecArray | null) => void): void {
    // Don't do anything, this is a mock.
  }

  public getChatAdministrators(chatId: number): Promise<TelegramBot.ChatMember[]> {
    return Promise.resolve([{
      can_send_polls: true,
      status: "administrator",
      user: {
        first_name: "Agadar",
        id: 0,
        is_bot: false,
      },
    }]);
  }
}
