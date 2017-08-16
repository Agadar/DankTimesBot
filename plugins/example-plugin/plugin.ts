import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";

/**
 * Example of the simplest DankTimesBot
 * plugin. Can be used as a template to
 * build new plugins.
 */
export class Plugin extends AbstractPlugin
{
  /**
   * A plugin should call its base constructor to
   * provide it with an identifier, a version
   * and some optional data.
   */
  constructor()
  {
    super("Example Plugin", "1.0.0", {});
  }

  /**
   * Pre-Message Process Hook.
   * Define any behaviour that occurs before DankTimesBot handles an incoming message.
   * @param _input Pre-Message Process input.
   */
  PreMessageProcess(_input: string): string
  {
    return "Example Plugin Pre Message Hook";
  }

  /**
   * Post-Message Process Hook.
   * Define any behaviour that occurs after DankTimesBot has handled an incoming message
   * and is ready to return some response.
   * @param _input Post-Message Process input.
   */
  PostMessageProcess(_input: string): string
  {
    return "Example Plugin Post Message Hook";
  }
} 