import { ITelegramClient } from "./i-telegram-client";
import { ITelegramClientListener } from "./i-telegram-client-listener";

export class TelegramClientMock implements ITelegramClient {

  public readonly botname = "testbot";

  public setOnAnyText(action: (msg: any, match: string[]) => string[]): void {
    // Don't do anything, this is a mock.
  }

  public async sendMessage(chatId: number, htmlMessage: string): Promise<void> {
    // Don't do anything, this is a mock.
  }

  public subscribe(subscriber: ITelegramClientListener): void {
    // Don't do anything, this is a mock.
  }

  public async deleteMessage(chatId: number, messageId: number): Promise<any> {
    // Don't do anything, this is a mock.
  }

  public getBotUsername(): Promise<string> {
    return Promise.resolve("test");
  }

  public setOnRegex(regExp: RegExp, action: (msg: any, match: string[]) => void): void {
    // Don't do anything, this is a mock.
  }

  public getChatAdministrators(chatId: number): Promise<any[]> {
    return Promise.resolve([{
      user: {
        id: 0,
      },
    }]);
  }
}
