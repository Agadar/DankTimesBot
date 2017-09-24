import { PluginEventArguments } from "../plugin-event-arguments";
import { Chat } from "../../../chat/chat";

/**
 * Leaderboard Reset Plugin Event Arguments.
 * Contains chat that has been reset.
 */
export class NoArgumentsPluginEventArguments extends PluginEventArguments
{
  /**
   * Constructor.
   */
  constructor()
  {
    super();
  }
}