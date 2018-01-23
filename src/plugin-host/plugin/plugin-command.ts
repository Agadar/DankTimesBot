
/**
 * Defines an interface for plugins
 * to register their own custom commands
 * with appropriate callbacks.
 * 
 * A Plugin Command must have some additional output.
 */
export class PluginCommand
{
  public readonly CommandString: string;
  public readonly Invoke: () => string[];

  constructor(_command: string, _callback: () => string[])
  {
    if(_command.length > 0 && _command[0] === '/')
      _command = _command.slice(1);
    this.CommandString = _command;
    this.Invoke = _callback;

    console.log("[DEBUG]: Registered command: " + _command);
  }
}