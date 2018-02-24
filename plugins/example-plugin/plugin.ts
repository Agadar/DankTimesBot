import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";
import { PluginEvent } from "../../src/plugin-host/plugin-events/plugin-event-types"
import { UserScoreChangedPluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PrePostMessagePluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/pre-post-message-plugin-event-arguments";
import { LeaderboardResetPluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";
import { NoArgumentsPluginEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/no-arguments-plugin-event-arguments";

/**
 * Example of auxiliary data classes.
 */
class ExamplePluginData
{
  public TestNumber: number = 0;
}

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

    // Example of sample dat
    this.data = new ExamplePluginData();
    this.data.TestNumber = 1;

    this.subscribeToPluginEvent(PluginEvent.PreMesssage, (_data: PrePostMessagePluginEventArguments) =>
    {
      return [`Example of a Pre Message Event`];
    });
    this.subscribeToPluginEvent(PluginEvent.UserScoreChange, (_data: UserScoreChangedPluginEventArguments) =>
    {
      return [`A player changed score! Player: ${_data.user.name}, change: ${_data.changeInScore}`,
              `Example of current leaderboard:`,
              `${JSON.stringify(this.services().Leaderboard().entries)} Okay.`];
    });
    this.subscribeToPluginEvent(PluginEvent.PostMessage, (_data: PrePostMessagePluginEventArguments) =>
    {
      return [`Example of a Post Message Event`];
    });
    this.subscribeToPluginEvent(PluginEvent.LeaderboardReset, (_data: LeaderboardResetPluginEventArguments) =>
    {
      return [`The leaderboard was reset for chat: ${_data.chat.id}`];
    });
    this.subscribeToPluginEvent(PluginEvent.DankShutdown, (_data: NoArgumentsPluginEventArguments) => 
    {
      console.log("Shutting down plugin! " + this.name);
    });

    this.registerCommand("test", (_params: string[]) => 
    {
      return [`success: ${JSON.stringify(_params)}`]; 
    })
  }
} 