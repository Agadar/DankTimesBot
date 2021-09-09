import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";

export class BotCommand {

  /**
   * Compares two bot commands using their names. Used for sorting collections.
   */
  public static compare(a: BotCommand, b: BotCommand) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  /**
   * Defines a new command for the Telegram bot.
   * @param name The name of the command, e.g. 'start'.
   * @param description Brief description of the command.
   * @param action The function which this command calls.
   * @param showInHelp Whether to list this command in the help output.
   * @param adminOnly Whether only admins can execute this command.
   * @param requiresConfirmation Whether this command requires explicit confirmation.
   * @param confirmationText The text for the confirmation.
   */
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly action: ((chat: Chat, user: User, msg: any, match: string[]) => string),
    public readonly showInHelp = true,
    public readonly adminOnly = false,
    public readonly requiresConfirmation = false,
    public readonly confirmationText = "🤔 Are you sure? Type 'yes' to confirm.") { }

  /**
   * Gets this command's regex, which is based on its name and the supplied bot name.
   */
  public getRegex(botname: string): RegExp {
    return RegExp(`^\/${this.name}(?:@${botname})?(?: )?(?:(?<= )(.*))?$`);
  }
}
