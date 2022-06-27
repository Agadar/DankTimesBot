import * as crypto from "crypto";
import fs from "fs";
import TelegramBot, { File, PhotoSize } from "node-telegram-bot-api";
import { ITelegramClient } from "./i-telegram-client";
import { ITelegramClientListener } from "./i-telegram-client-listener";

export class TelegramClient implements ITelegramClient {

    private static readonly FILE_DOWNLOAD_AUTOREMOVE_DELAY_MINUTES = 15;
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

    public sendMessage(chatId: number, htmlMessage: string, replyToMessageId?: number, forceReply = false): Promise<void | TelegramBot.Message> {
        const parameters = this.getSendMessageParameters(replyToMessageId, forceReply);
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
        const path = "./tmp/dtb/" + crypto.randomUUID();
        if (!fs.existsSync(path)) {
            if (!fs.mkdirSync(path, {recursive: true})) {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, "Could not create file location"));
            }
        }
        return this.bot.downloadFile(fileId, path)
            .then((x) => {
                setTimeout(() => {
                    // Auto cleanup
                    if (fs.existsSync(x)) {
                        fs.rmSync(x);
                    }
                }, (60 * 1000) * TelegramClient.FILE_DOWNLOAD_AUTOREMOVE_DELAY_MINUTES);
                return x;
            })
            .catch((reason: void | TelegramBot.Message) => {
                this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
            });
    }

    public sendFile(chatId: number, filePath: string, replyToMessageId: number, forceReply: boolean, caption = "", type: "photo" | "video" = "photo"): Promise<TelegramBot.Message | void> {
        if (!fs.existsSync(filePath)) {
            this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, "File does not exist!"));
            return new Promise(() => {
                return;
            });
        } else {
            switch(type) {
                case "photo": 
                    return this.bot.sendPhoto(chatId, filePath, {
                        reply_to_message_id: replyToMessageId,
                        caption: caption
                    }).catch((reason: void | TelegramBot.Message) => { this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason)); });
                case "video":
                    return this.bot.sendAnimation(chatId, filePath, {
                        reply_to_message_id: replyToMessageId,
                        caption: caption
                    }).catch((reason: void | TelegramBot.Message) => { this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason)); });
            }
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

    private getSendMessageParameters(replyToUserId?: number, forceReply = false): TelegramBot.SendMessageOptions {
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: TelegramClient.PARSE_MODE,
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
