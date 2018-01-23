
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
  public readonly Invoke: (_params: string[]) => string[];

  constructor(_command: string, _callback: (_params: string[]) => string[])
  {
    if(_command.length > 0 && _command[0] === '/')
      _command = _command.slice(1);
    this.CommandString = _command;
    this.Invoke = _callback;
  }
}