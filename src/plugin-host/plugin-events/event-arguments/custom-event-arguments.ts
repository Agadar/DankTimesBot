import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the Custom event.
 */
export class CustomEventArguments extends PluginEventArguments {

  /**
   * Any relevant event data. Consumers of these arguments will have
   * to cast/parse this and trust it is of the type they expect.
   */
  public readonly eventData?: any;

  constructor(nameOfOriginPlugin: string, reason?: string, eventData?: any) {
    super(nameOfOriginPlugin, reason);
    this.eventData = eventData;
  }
}
