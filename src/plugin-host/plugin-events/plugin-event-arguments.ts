/**
 * Plugin Event Messages are used to communicate data
 * between a Plugin Host and its associated plugins.
 */
export abstract class PluginEventArguments {

  public static readonly DANKTIMESBOT_SOURCE = "";
  public static readonly NO_REASON_GIVEN = "";

  /**
   * The name of the plugin that fired this event, or empty if DankTimesBot fired the event.
   */
  public readonly nameOfOriginPlugin: string;

  /**
   * The reason this event was fired, or empty if no reason is given.
   */
  public readonly reason: string;

  constructor(nameOfOriginPlugin = PluginEventArguments.DANKTIMESBOT_SOURCE, reason = PluginEventArguments.NO_REASON_GIVEN) {
    this.nameOfOriginPlugin = nameOfOriginPlugin;
    this.reason = reason;
  }
}
