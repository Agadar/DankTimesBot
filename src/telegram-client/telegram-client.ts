import fs from "fs";
import TelegramBot, { File, PhotoSize } from "node-telegram-bot-api";
import { ITelegramClient } from "./i-telegram-client";
import { ITelegramClientListener } from "./i-telegram-client-listener";

export class TelegramClient implements ITelegramClient {

    private static readonly PARSE_MODE = "HTML";

    private cachedBotUsername = "";
    private botUsernamePromise: Promise<string> | null = null;

    private readonly listeners: ITelegramClientListener[] = [];

    constructor(private readonly bot: TelegramBot) { }

    public setOnAnyText(action: ((msg: TelegramBot.Message) => string[])): void {
        this.bot.on("message", (msg: TelegramBot.Message, metadata: TelegramBot.Metadata) => {
            const output = action(msg);
            if (output) {
                output.forEach((out) => this.sendMessage(msg.chat.id, out));
            }
        });
    }

    public setOnRegex(regExp: RegExp, action: (msg: TelegramBot.Message, match: RegExpExecArray | null) => void): void {
        this.bot.onText(regExp, action);
    }

    public getChatAdministrators(chatId: number): Promise<TelegramBot.ChatMember[]> {
        return this.bot.getChatAdministrators(chatId);
    }

    public sendMessage(chatId: number, htmlMessage: string, replyToMessageId?: number, forceReply = false, disableWebPagePreview = false): Promise<void | TelegramBot.Message> {
        const parameters = this.getSendMessageParameters(replyToMessageId, forceReply, disableWebPagePreview);
        return this.bot.sendMessage(chatId, htmlMessage, parameters)
            .catch((reason: any) => {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
            });
    }

    public deleteMessage(chatId: number, messageId: number): Promise<boolean | void> {
        return this.bot.deleteMessage(chatId, messageId.toString())
            .catch((reason: void | TelegramBot.Message) => {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
            });
    }

    public editMessage(chatId: number, messageId: number, newMessageText: string): Promise<boolean | void | TelegramBot.Message> {
        return this.bot.editMessageText(newMessageText, {message_id: messageId, chat_id: chatId, parse_mode: TelegramClient.PARSE_MODE})
            .catch((reason: void | TelegramBot.Message) => {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
            });
    }

    public retrieveFile(chatId: number, fileId: string): Promise<string | void> {
        if (!fs.existsSync("./tmp/dtb")) {
            fs.mkdir("./tmp/dtb", {recursive: true}, err => {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, "Could not create file location"));
            });
        }
        return this.bot.downloadFile(fileId, "./tmp/dtb")
            .catch((reason: void | TelegramBot.Message) => {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
            });
    }

    public sendFile(chatId: number, filePath: string, replyToMessageId: number, forceReply: boolean): Promise<TelegramBot.Message | void> {
        if (!fs.existsSync(filePath)) {
            this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, "File does not exist!"));
            return new Promise(() => {
                return;
            });
        } else {
            return this.bot.sendPhoto(chatId, filePath, {
                reply_to_message_id: replyToMessageId,
            }).catch((reason: void | TelegramBot.Message) => { this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason)); });
        }
    }

    public subscribe(subscriber: ITelegramClientListener): void {
        if (this.listeners.indexOf(subscriber) === -1) {
            this.listeners.push(subscriber);
        }
    }

    public getBotUsername(): Promise<string> {
        if (this.cachedBotUsername !== "") {
            return Promise.resolve(this.cachedBotUsername);
        }
        if (this.botUsernamePromise !== null) {
            return this.botUsernamePromise;
        }
        return this.botUsernamePromise = this.bot.getMe()
            .then((me: TelegramBot.User) => {
                this.cachedBotUsername = me.username ?? "";
                this.botUsernamePromise = null;
                return this.cachedBotUsername;
            });
    }

    private getSendMessageParameters(replyToUserId?: number, forceReply = false, disableWebPagePreview = false): TelegramBot.SendMessageOptions {
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: TelegramClient.PARSE_MODE,
            disable_web_page_preview: disableWebPagePreview
        };

        if (replyToUserId) {
            options.reply_to_message_id = replyToUserId;
        }

        if (forceReply) {
            options.reply_markup = {
                force_reply: true,
                selective: true,
            };
        }
        return options;
    }
}
