import { TelegramClient } from "./telegram-client";
import { TelegramBotCommand } from "../telegram-bot-command/telegram-bot-command";

export class TelegramClientMock implements TelegramClient {

  public readonly commands = new Map<string, TelegramBotCommand>();
  public readonly botname = 'testbot';

  public initialize(apiKey: string): void { }

  public retrieveBotName(): Promise<string> {
    return new Promise(() => {
      return this.botname;
    });
  }

  public setOnAnyText(action: (msg: any, match: string[]) => string): void { }

  public registerCommand(command: TelegramBotCommand): void { }

  public sendMessage(chatId: number, htmlMessage: string): void { }
}
