/**
 * Represents a command that can be executed by a Telegram bot.
 */
export class Command {

  /**
   * Defines a new command for the Telegram bot.
   * @param name The name of the command, e.g. 'start'.
   * @param description Brief description of the command.
   * @param object The object to call the function on.
   * @param _function The function which this command calls. Expected to take parameters 'msg' and 'match' and return a string.
   * @param adminOnly Whether only admins can execute this command.
   * @param requiresConfirmation Whether this command requires explicit confirmation.
   */
  constructor(public readonly name: string,
    public readonly description: string,
    public readonly object: object,
    public readonly _function: Function,
    public readonly adminOnly = false,
    public readonly requiresConfirmation = false) {}

  /**
   * Gets this command's regex, which is based on its name and the supplied bot name.
   */
  public getRegex(botname: string): RegExp {
    return RegExp('^\\/' + this.name + '(@' + botname + ')?(\\s{1}\\S+)*$');
  };
};