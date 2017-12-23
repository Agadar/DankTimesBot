import { BotCommand } from "../bot-commands/bot-command";

export interface ITelegramClient {
  readonly commands: Map<string, BotCommand>;
  executeCommand(msg: any, match: string[], botCommand: BotCommand): Promise<string>;
  setOnAnyText(action: ((msg: any, match: string[]) => string)): void;
  registerCommand(command: BotCommand): Promise<void>;
  sendMessage(chatId: number, htmlMessage: string): Promise<any>;
}
