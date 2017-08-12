import { TelegramBotCommand } from './telegram-bot-command';

export interface TelegramClient {
    readonly commands: Map<string, TelegramBotCommand>;
    botname: string;
    initialize(apiKey: string): void;
    retrieveBotName(): Promise<string>;
    setOnAnyText(action: ((msg: any, match: string[]) => string)): void;
    registerCommand(command: TelegramBotCommand): void;
    sendMessage(chatId: number, htmlMessage: string): void;
}