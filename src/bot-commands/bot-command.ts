import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { BotCommandConfirmationQuestion } from "./bot-command-confirmation-question";

export class BotCommand {

    /**
   * Compares two bot commands using their names. Used for sorting collections.
   */
    public static compare(a: BotCommand, b: BotCommand) {
        if (a.names[0] < b.names[0]) {
            return -1;
        }
        if (a.names[0] > b.names[0]) {
            return 1;
        }
        return 0;
    }

    /**
   * Defines a new command for the Telegram bot.
   * @param names The names of the command, e.g. 'start'. At least one should be specified.
   * @param description Brief description of the command.
   * @param action The function which this command calls.
   * @param showInHelp Whether to list this command in the help output.
   * @param adminOnly Whether only admins can execute this command.
   */
    constructor(
    public readonly names: string[],
    public readonly description: string,
    public readonly action: ((chat: Chat, user: User, msg: TelegramBot.Message, params: string) => string | BotCommandConfirmationQuestion),
    public readonly showInHelp = true,
    public readonly adminOnly = false) { }

    /**
   * Gets this command's regex, which is based on its names and the supplied bot name.
   */
    public getRegex(botname: string): RegExp {
        let regex = `^/(?:${this.names[0]}`;

        for (let i = 1; i < this.names.length; i++) {
            regex += `|${this.names[i]}`;
        }
        regex += `)(?:@${botname})?(?: )?(?:(?<= )(.*))?$`;
        return RegExp(regex, 'i');
    }
}
