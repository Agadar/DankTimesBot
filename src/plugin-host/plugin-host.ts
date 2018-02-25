import { AbstractPlugin } from "./plugin/plugin";
import { PluginEvent } from "./plugin-events/plugin-event-types";
import { PrePostMessagePluginEventArguments } from "./plugin-events/event-arguments/pre-post-message-plugin-event-arguments";
import { UserScoreChangedPluginEventArguments } from "./plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { LeaderboardResetPluginEventArguments } from "./plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";
import { NoArgumentsPluginEventArguments } from "./plugin-events/event-arguments/no-arguments-plugin-event-arguments";
import { ChatServices } from "./plugin-chat-services/chat-services";
import { Chat } from "../chat/chat";
import { plugins } from "../context-root";

/**
 * Class exposing the Plugin Host concept.
 * Plugins are managed by a Plugin Host, which controls
 * messaging to, from and between plugins. It also
 * keeps track of the general state of a plugin.
 */
export class PluginHost {
  /**
   * Collection of plugins currently running.
   */
  public readonly plugins: AbstractPlugin[];
  private chatservices: ChatServices;

  /**
   * Create a new Plugin Host.
   * The Plugin Host will not by itself try and
   * find compatible plugins. Instead, it requests
   * a list of plugins to be provided.
   * @param plugins List of plugins this PluginHost should manage.
   */
  constructor(plugins: AbstractPlugin[]) {
    this.plugins = plugins;
  }

  public set services (cServices: ChatServices)
  {
    this.chatservices = cServices;
    plugins.forEach(plugin => plugin.services = this.chatservices);
  }

  /* Overload List */
  public trigger(event: PluginEvent.PreMesssage, input: PrePostMessagePluginEventArguments): string[];
  public trigger(event: PluginEvent.PostMessage, input: PrePostMessagePluginEventArguments): string[];
  public trigger(event: PluginEvent.UserScoreChange, input: UserScoreChangedPluginEventArguments): string[];
  public trigger(event: PluginEvent.LeaderboardReset, input: LeaderboardResetPluginEventArguments): string[];
  public trigger(event: PluginEvent.DankShutdown, input: NoArgumentsPluginEventArguments): string[];
  public trigger(event: PluginEvent.PostInit, input: NoArgumentsPluginEventArguments): string[];
  /**
   * Trigger a certain event on this Plugin Host's plugins.
   * @param event Event to trigger.
   * @param input Data input.
   */
  public trigger(event: PluginEvent, input: any): string[] {
    let out: string[] = [];
    this.plugins.forEach(plugin => {
      let output: string[] = plugin.triggerEvent(event, input);
      out = out.concat(output);
    });
    return out;
  }

  public triggerCommand(command: string, params: string[]): string[] {
    let out: string[] = [];
    this.plugins.forEach(plugin => {
      let output: string[] = plugin.triggerCommand(command, params);
      out = out.concat(output);
    });
    return out;
  }
}