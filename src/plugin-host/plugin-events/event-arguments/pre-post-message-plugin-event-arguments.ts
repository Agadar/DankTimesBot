import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the Pre / Post message.
 * Contains the message text.
 */
export class PrePostMessagePluginEventArguments extends PluginEventArguments
{
  /**
   * Raw message going into / coming out of the Dank Times Bot process.
   */
  public readonly Message: string;

  /**
   * Constructor.
   * @param _message Raw telegram message.
   */
  constructor(_message: string)
  {
    super();
    this.Message = _message;
  }
}
