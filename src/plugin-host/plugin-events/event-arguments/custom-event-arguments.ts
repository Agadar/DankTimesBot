import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the Custom event.
 */
export class CustomEventArguments extends PluginEventArguments {

  /**
   * The name of the plugin that fired this event.
   */
  public readonly nameOfOriginPlugin: string;

  /**
   * The reason for the event.
   */
  public readonly reason: string;

  /**
   * Any relevant event data. Consumers of these arguments will have
   * to cast/parse this and trust it is of the type they expect.
   */
  public readonly eventData?: any;

  /**
   * Constructor.
   * @param nameOfOriginPlugin The name of the plugin that fired this event.
   * @param reason The reason for the event.
   * @param eventData Any relevant event data. Consumers of these arguments will have
   * to cast/parse this and trust it is of the type they expect.
   */
  constructor(nameOfOriginPlugin: string, reason: string, eventData?: any) {
    super();
    this.nameOfOriginPlugin = nameOfOriginPlugin;
    this.reason = reason;
    this.eventData = eventData;
  }
}
