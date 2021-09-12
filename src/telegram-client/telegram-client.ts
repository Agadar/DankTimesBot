import TelegramBot from "node-telegram-bot-api";
import { ITelegramClient } from "./i-telegram-client";
import { ITelegramClientListener } from "./i-telegram-client-listener";

export class TelegramClient implements ITelegramClient {

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
      parse_mode: "HTML",
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
