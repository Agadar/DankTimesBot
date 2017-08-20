import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";
import { PLUGIN_EVENT } from "../../src/plugin-host/plugin-events/plugin-event-types"
import { UserScoreChangedPluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PrePostMessagePluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/pre-post-message-plugin-event-arguments";
import { LeaderboardResetPluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";

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
    this.subscribeToPluginEvent(PLUGIN_EVENT.PLUGIN_EVENT_PRE_MESSAGE, (_data: PrePostMessagePluginEventArguments) =>
    {
      return `Example of a Pre Message Event`;
    });
    this.subscribeToPluginEvent(PLUGIN_EVENT.PLUGIN_EVENT_USER_CHANGED_SCORE, (_data: UserScoreChangedPluginEventArguments) =>
    {
      return `A player changed score! Player: ${_data.User.name}, change: ${_data.ChangeInScore}`;
    });
    this.subscribeToPluginEvent(PLUGIN_EVENT.PLUGIN_EVENT_POST_MESSAGE, (_data: PrePostMessagePluginEventArguments) =>
    {
      return `Example of a Post Message Event`;
    });
    this.subscribeToPluginEvent(PLUGIN_EVENT.PLUGIN_EVENT_LEADERBOARD_RESET, (_data: LeaderboardResetPluginEventArguments) =>
    {
      return `The leaderboard was reset for chat: ${_data.Chat.id}`
    });
  }
} 