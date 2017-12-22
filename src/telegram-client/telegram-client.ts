import { BotCommand } from "../bot-commands/bot-command";
import { ITelegramClient } from "./i-telegram-client";

/**
 * The Telegram Client that communicates with the API via the 'node-telegram-bot-api' library.
 */
export class TelegramClient implements ITelegramClient {

  public readonly commands = new Map<string, BotCommand>();
  private myBotname = "";

  constructor(private readonly bot: any) { }

  /**
   * Retrieves and stores the bot's name from the API.
   */
  public retrieveBotName(): Promise<string> {
    const thisRef = this;
    return this.bot.getMe().then((me: any) => {
      thisRef.myBotname = me.username;
      return me.username;
    });
  }

  /**
   * Gets the bot's name, or an empty string if this.retrieveBotName() wasn't called yet.
   */
  public get botname(): string {
    return this.myBotname;

  }

  /**
   * Sets the action to do on ANY incoming text.
   */
  public setOnAnyText(action: ((msg: any, match: string[]) => string)): void {
    this.bot.on("message", (msg: any, match: string[]) => {
      const output = action(msg, match);
      if (output) {
        this.sendMessage(msg.chat.id, output);
      }
    });
  }

  /**
   * Registers a new command, overriding any with the same name.
   */
  public registerCommand(command: BotCommand): void {
    this.commands.set(command.name, command);

    // Register the command with the bot accordingly.
    if (!command.adminOnly) {
      this.bot.onText(command.getRegex(this.myBotname), (msg: any, match: string[]) => {
        this.sendMessage(msg.chat.id, command.action.call(command.object, msg, match));
      });
    } else {
      this.bot.onText(command.getRegex(this.myBotname), (msg: any, match: string[]) => {
        this.callFunctionIfUserIsAdmin(msg, match, command.object, command.action);
      });
    }
  }

  public sendMessage(chatId: number, htmlMessage: string): void {
    this.bot.sendMessage(chatId, htmlMessage, { parse_mode: "HTML" }).catch((reason: any) => {
      console.warn(`Telegram API returned HTTP status code ${reason.response.statusCode}`
        + ` when this bot attempted to send a message to chat with id ${chatId}.`
        + ` Error description: '${reason.response.body.description}'.`);
    });
  }

  /**
   * Calls the specified function, but only if the calling user is an admin in his chat, or it is a private chat.
   */
  private callFunctionIfUserIsAdmin(
    msg: any, match: string[], object: any,
    action: ((msg: any, match: string[]) => string)): void {

    // Only groups have admins, so if this chat isn't a group, continue straight to callback.
    if (msg.chat.type === "private") {
      this.sendMessage(msg.chat.id, action.call(object, msg, match));
      return;
    }

    // Else if this chat is a group, then we must make sure the user is an admin.
    this.bot.getChatAdministrators(msg.chat.id).then((admins: any[]) => {

      // Check to ensure user is admin. If not, post message.
      for (const admin of admins) {
        if (admin.user.id === msg.from.id) {
          this.sendMessage(msg.chat.id, action.call(object, msg, match));
          return;
        }
      }
      this.sendMessage(msg.chat.id, "This option is only available to admins!");
    }).catch((reason: any) => {
      console.error("Failed to retrieve admin list!\n" + reason);
      this.sendMessage(msg.chat.id, "Failed to retrieve admin list! See server console.");
    });
  }
}
