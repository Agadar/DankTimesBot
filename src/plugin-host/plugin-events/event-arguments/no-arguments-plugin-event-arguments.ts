import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Explicit EventArguments class signalling that
 * there are no arguments. Sort of a null-object for eventargs.
 */
export class NoArgumentsPluginEventArguments extends PluginEventArguments {
  /**
   * Constructor.
   */
  constructor() {
    super();
  }
}
