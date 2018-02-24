import { PluginEventArguments } from "../plugin-events/plugin-event-arguments";
import { PluginEvent } from "../plugin-events/plugin-event-types";
import { UserScoreChangedPluginEventArguments } from "../plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PrePostMessagePluginEventArguments } from "../plugin-events/event-arguments/pre-post-message-plugin-event-arguments";
import { LeaderboardResetPluginEventArguments } from "../plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";
import { NoArgumentsPluginEventArguments } from "../plugin-events/event-arguments/no-arguments-plugin-event-arguments";
import { ChatServices } from "../plugin-chat-services/chat-services";
import { PluginCommand } from "./plugin-command";

/**
 * Class defining the interface every plugin should adhere to.
 */
export abstract class AbstractPlugin {
  /**
   * Semantic identifier of this plugin. 
   */
  public name: string;
  /**
   * Version of this plugin.
   */
  public version: string;
  /**
   * Boolean indicating the status of this plugin.
   * Disabled plugins will not receive messages
   * from its Plugin Host.
   */
  public enabled: boolean;
  /**
   * Internal plugin state.
   */
  protected data: any;

  /**
   * Services for this chat
   */
  public services: () => ChatServices;

  /**
   * Plugin ID
   */
  public pID: () => string;

  /**
   * Event triggers. Plugins can hook functions to certain Plugin Events.
   * These plugin events are defined in the PLUGIN_EVENT enumeration.
   */
  private pluginEventTriggers: Map<PluginEvent, (data: any) => any>;

  /**
   * Command triggers. Plugins can hook functions to certain commands.
   * these commands can be set in the constructor of a plugin.
   */
  private pluginCommandTriggers: PluginCommand[];

  /**
   * Create a new Plugin instance.
   * @param name Semantic name of this plugin.
   * @param version Version of this plugin.
   * @param data Any optional data that might require to be stored
   *              for this plugin.
   */
  constructor(name: string, version: string, data: any) {
    this.name = name;
    this.version = version;
    this.data = data;
    this.pluginEventTriggers = new Map<PluginEvent, (data: any) => any>();
    this.pluginCommandTriggers = [];
  };

  /* Function overload list */
  protected subscribeToPluginEvent(event: PluginEvent.PreMesssage, eventFn: (data: PrePostMessagePluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.PostMessage, eventFn: (data: PrePostMessagePluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.UserScoreChange, eventFn: (data: UserScoreChangedPluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.LeaderboardReset, eventFn: (data: LeaderboardResetPluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.DankShutdown, eventFn: (data: NoArgumentsPluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.PostInit, eventFn: (data: NoArgumentsPluginEventArguments) => any): void;
  /**
   * Subscribe to a certain PLUGIN_EVENT.
   * @param _event Plugin event to describe to.
   * @param eventFn Function to execute when a certain event is triggered.
   */
  protected subscribeToPluginEvent(event: PluginEvent, eventFn: (data: any) => any): void {
    this.pluginEventTriggers.set(event, eventFn);
  }

  /**
   * Register a new plugin commands.
   * These are custom /commands that can be invoked
   * by users in a chat.
   * @param _command /{command} of the function. Without preceding '/'
   * @param commandFn Function that returns an array of possible output strings.
   */
  protected registerCommand(command: string, commandFn: (params: string[]) => string[]) {
    this.pluginCommandTriggers.push(new PluginCommand(command, commandFn));
  }

  /**
   * Trigger a plugin command if one is available.
   * @param _command command to trigger.
   */
  public triggerCommand(command: string, params: string[]): string[] {
    let output: string[] = [];

    if (!this.enabled) return output;

    let trigger = this.pluginCommandTriggers.find(commands => commands.commandString === command);
    if (trigger) {
      output = output.concat(trigger.invoke(params));
    }

    return output;
  }

  /**
   * Trigger a certain PLUGIN_EVENT on this plugin.
   * @param event PLUGIN_EVENT to trigger.
   */
  public triggerEvent(event: PluginEvent, data: PluginEventArguments): string[] {
    let output: string[] = [];

    if (!this.enabled) return output;

    if (this.pluginEventTriggers.has(event)) {
      output = output.concat((<(data: any) => any>this.pluginEventTriggers.get(event))(data));
    }

    return output;
  }
}