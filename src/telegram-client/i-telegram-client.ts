import { TelegramBotCommand } from "../telegram-bot-command/telegram-bot-command";

export interface ITelegramClient {
  readonly commands: Map<string, TelegramBotCommand>;
  retrieveBotName(): Promise<string>;
  setOnAnyText(action: ((msg: any, match: string[]) => string)): void;
  registerCommand(command: TelegramBotCommand): void;
  sendMessage(chatId: number, htmlMessage: string): void;
}
