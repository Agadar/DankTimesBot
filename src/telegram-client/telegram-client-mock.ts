import { TelegramBotCommand } from "../telegram-bot-command/telegram-bot-command";
import { TelegramClient } from "./telegram-client";

export class TelegramClientMock implements TelegramClient {

  public readonly commands = new Map<string, TelegramBotCommand>();
  public readonly botname = "testbot";

  public initialize(apiKey: string): void {
    // Don't do anything, this is a mock.
  }

  public retrieveBotName(): Promise<string> {
    return new Promise(() => {
      return this.botname;
    });
  }

  public setOnAnyText(action: (msg: any, match: string[]) => string): void {
    // Don't do anything, this is a mock.
   }

  public registerCommand(command: TelegramBotCommand): void {
    // Don't do anything, this is a mock.
  }

  public sendMessage(chatId: number, htmlMessage: string): void {
    // Don't do anything, this is a mock.
  }
}
