import { TelegramBotCommand } from "../telegram-bot-command/telegram-bot-command";

export interface TelegramClient {
  readonly commands: Map<string, TelegramBotCommand>;
  readonly botname: string;
  initialize(apiKey: string): void;
  retrieveBotName(): Promise<string>;
  setOnAnyText(action: ((msg: any, match: string[]) => string)): void;
  registerCommand(command: TelegramBotCommand): void;
  sendMessage(chatId: number, htmlMessage: string): void;
}
