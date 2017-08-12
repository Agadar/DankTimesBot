import TelegramBot = require('node-telegram-bot-api');
import { TelegramBotCommand } from './telegram-bot-command';
import { TelegramClient } from "./telegram-client";

/**
 * The Telegram Client that communicates with the API via the 'node-telegram-bot-api' library.
 */
export class TelegramClientImpl implements TelegramClient {

  public readonly commands = new Map<string, TelegramBotCommand>();
  private bot: TelegramBot | undefined;
  private _botname = '';
  private readonly botNotInitializedMsg = 'Bot not initialized - call #initialize(...) first!';

  public initialize(apiKey: string): void {
    this.bot = new TelegramBot(apiKey, { polling: true });
  }

  /**
   * Retrieves and stores the bot's name from the API.
   */
  public retrieveBotName(): Promise<string> {
    if (!this.bot) {
      throw new Error(this.botNotInitializedMsg);
    }
    const _this = this;
    return this.bot.getMe().then(me => {
      _this._botname = me.username;
      return me.username;
    });
  };

  /**
   * Gets the bot's name, or an empty string if this.retrieveBotName() wasn't called yet.
   */
  public get botname(): string {
    return this._botname;

  }

  /**
   * Sets the action to do on ANY incoming text.
   */
  public setOnAnyText(action: ((msg: any, match: string[]) => string)): void {
    if (!this.bot) {
      throw new Error(this.botNotInitializedMsg);
    }
    this.bot.on('message', (msg, match) => {
      const output = action(msg, match);
      if (output) {
        this.sendMessage(msg.chat.id, output);
      }
    });
  };

  /**
   * Registers a new command, overriding any with the same name.
   */
  public registerCommand(command: TelegramBotCommand): void {
    if (!this.bot) {
      throw new Error(this.botNotInitializedMsg);
    }
    this.commands.set(command.name, command);

    // Register the command with the bot accordingly.
    if (!command.adminOnly) {
      this.bot.onText(command.getRegex(this._botname), (msg, match) => {
        this.sendMessage(msg.chat.id, command.action.call(command.object, msg, match));
      });
    } else {
      this.bot.onText(command.getRegex(this._botname), (msg, match) => {
        this.callFunctionIfUserIsAdmin(msg, match, command.object, command.action);
      });
    }
  };

  public sendMessage(chatId: number, htmlMessage: string): void {
    if (!this.bot) {
      throw new Error(this.botNotInitializedMsg);
    }
    this.bot.sendMessage(chatId, htmlMessage, { parse_mode: 'HTML' }).catch(reason => {
      console.warn('Telegram API returned HTTP status code ' + reason.response.statusCode + ' when this bot attempted to send a message to chat with id ' + chatId
        + '. Error description: \'' + reason.response.body.description + '\'.');
    });
  };

  /**
   * Calls the specified function, but only if the calling user is an admin in his chat, or it is a private chat.
   */
  private callFunctionIfUserIsAdmin(msg: any, match: string[], object: any, action: ((msg: any, match: string[]) => string)): void {
    if (!this.bot) {
      throw new Error(this.botNotInitializedMsg);
    }

    // Only groups have admins, so if this chat isn't a group, continue straight to callback.
    if (msg.chat.type === 'private') {
      this.sendMessage(msg.chat.id, action.call(object, msg, match));
      return;
    }

    // Else if this chat is a group, then we must make sure the user is an admin.
    this.bot.getChatAdministrators(msg.chat.id).then(admins => {

      // Check to ensure user is admin. If not, post message.
      for (const admin of admins) {
        if (admin.user.id === msg.from.id) {
          this.sendMessage(msg.chat.id, action.call(object, msg, match));
          return;
        }
      }
      this.sendMessage(msg.chat.id, 'This option is only available to admins!');
    }).catch(reason => {
      console.error('Failed to retrieve admin list!\n' + reason);
      this.sendMessage(msg.chat.id, 'Failed to retrieve admin list! See server console.');
    });
  }
};
