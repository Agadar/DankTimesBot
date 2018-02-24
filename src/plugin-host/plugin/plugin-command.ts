/**
 * Defines an interface for plugins
 * to register their own custom commands
 * with appropriate callbacks.
 * 
 * A Plugin Command must have some additional output.
 */
export class PluginCommand {
  public readonly commandString: string;
  public readonly invoke: (params: string[]) => string[];

  constructor(command: string, callback: (params: string[]) => string[]) {
    if (command.length > 0 && command[0] === '/')
      command = command.slice(1);
    this.commandString = command;
    this.invoke = callback;
  }
}