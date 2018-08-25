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

  constructor(private readonly bot: any, private readonly chatRegistry: IChatRegistry) { }

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
      this.executeCommand(msg, match, command)
        .then(
          (reply) => this.sendMessage(msg.chat.id, reply),
          (reason) => console.error(reason),
      );
    });
  }

  public sendMessage(chatId: number, htmlMessage: string): Promise<any> {
    return this.bot.sendMessage(chatId, htmlMessage, { parse_mode: "HTML" })
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
}
