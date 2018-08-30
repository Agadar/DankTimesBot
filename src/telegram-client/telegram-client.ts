import { BotCommand } from "../bot-commands/bot-command";
import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { ITelegramClient } from "./i-telegram-client";
import { ITelegramClientListener } from "./i-telegram-client-listener";

/**
 * The Telegram Client that communicates with the API via the 'node-telegram-bot-api' library.
 */
export class TelegramClient implements ITelegramClient {

  public readonly commands = new Map<string, BotCommand>();

  private cachedBotUsername = "";
  private botUsernamePromise: Promise<string> | null = null;

  private readonly developerUserId = 100805902;
  private readonly listeners: ITelegramClientListener[] = [];

  constructor(private readonly bot: any,
              private readonly moment: any,
              private readonly chatRegistry: IChatRegistry) { }

  /**
   * Sets the action to do on ANY incoming text.
   */
  public setOnAnyText(action: ((msg: any, match: string[]) => string[])): void {
    this.bot.on("message", (msg: any, match: string[]) => {
      const output = action(msg, match);
      if (output) {
        output.forEach((out) => this.sendMessage(msg.chat.id, out));
      }
    });
  }

  /**
   * Registers a new command, throwing an error if a command with the same name already exists.
   * @param command The command to register.
   */
  public async registerCommand(command: BotCommand): Promise<void> {

    if (this.commands.has(command.name)) {
      throw new Error(`A command with the name '${command.name}' already exists!`);
    }

    this.commands.set(command.name, command);
    const botUsername = await this.getBotUsername();
    const commandRegex = command.getRegex(botUsername);

    this.bot.onText(commandRegex, (msg: any, match: string[]) => {
      if (this.moment.tz("UTC").unix() - msg.date < 60) {
        this.executeCommand(msg, match, command)
          .then(
            (reply) => {
              if (reply) {
                this.sendMessage(msg.chat.id, reply);
              }
            },
            (reason) => console.error(reason),
        );
      }
    });
  }

  /**
   * Sends a message to the Telegram Bot API.
   * @param chatId The id of the chat to send a message to.
   * @param htmlMessage The HTML message to send.
   * @param replyToMessageId The (optional) id of the message to reply to.
   * @param forceReply Whether to force the replied-to or tagged user to reply to this message. False by default.
   */
  public sendMessage(chatId: number, htmlMessage: string, replyToMessageId = -1, forceReply = false): Promise<any> {
    const parameters = this.getSendMessageParameters(replyToMessageId, forceReply);
    return this.bot.sendMessage(chatId, htmlMessage, parameters)
      .catch((reason: any) => {
        this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
      });
  }

  /**
   * Deletes a message via the Telegram Bot API.
   * @param chatId The id of the chat to delete a message in.
   * @param messageId The id of the message to delete.
   */
  public deleteMessage(chatId: number, messageId: number): Promise<any> {
    return this.bot.deleteMessage(chatId, messageId)
      .catch((reason: any) => {
        this.listeners.forEach((listener) => listener.onErrorFromApi(chatId, reason));
      });
  }

  public async executeCommand(msg: any, match: string[], botCommand: BotCommand): Promise<string> {
    let userIsAllowedToExecuteCommand = false;

    try {
      userIsAllowedToExecuteCommand = await this.userIsAllowedToExecuteCommand(msg, botCommand);
    } catch (err) {
      console.error("Failed to retrieve admin list!\n" + err);
      return "⚠️ Failed to retrieve admin list! See server console.";
    }

    if (!userIsAllowedToExecuteCommand) {
      return "🚫 This option is only available to admins!";
    }

    const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
    const user = chat.getOrCreateUser(msg.from.id, msg.from.username);
    return botCommand.action(chat, user, msg, match);
  }

  public subscribe(subscriber: ITelegramClientListener): void {
    if (this.listeners.indexOf(subscriber) === -1) {
      this.listeners.push(subscriber);
    }
  }

  private async userIsAllowedToExecuteCommand(msg: any, botCommand: BotCommand): Promise<boolean> {
    if (!botCommand.adminOnly || msg.chat.type === "private" || msg.from.id === this.developerUserId) {
      return true;
    }

    const admins = await this.bot.getChatAdministrators(msg.chat.id);

    for (const admin of admins) {
      if (admin.user.id === msg.from.id) {
        return true;
      }
    }
    return false;
  }

  private async getBotUsername(): Promise<string> {
    if (this.cachedBotUsername !== "") {
      return this.cachedBotUsername;
    }
    if (this.botUsernamePromise !== null) {
      return this.botUsernamePromise;
    }
    return this.botUsernamePromise = this.bot.getMe()
      .then((me: any) => {
        this.cachedBotUsername = me.username;
        this.botUsernamePromise = null;
        return this.cachedBotUsername;
      });
  }

  private getSendMessageParameters(replyToUserId = -1, forceReply = false): any {
    const options: any = {
      parse_mode: "HTML",
    };

    if (replyToUserId !== -1) {
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
