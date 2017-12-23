import { BotCommand } from "../bot-commands/bot-command";
import { ITelegramClient } from "./i-telegram-client";

export class TelegramClientMock implements ITelegramClient {

  public readonly commands = new Map<string, BotCommand>();
  public readonly botname = "testbot";

  public async executeCommand(msg: any, match: string[], botCommand: BotCommand): Promise<string> {
    return "";
  }

  public setOnAnyText(action: (msg: any, match: string[]) => string): void {
    // Don't do anything, this is a mock.
  }

  public async registerCommand(command: BotCommand): Promise<void> {
    // Don't do anything, this is a mock.
  }

  public async sendMessage(chatId: number, htmlMessage: string): Promise<void> {
    // Don't do anything, this is a mock.
  }
}
