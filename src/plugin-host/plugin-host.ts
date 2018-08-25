import { Chat } from "../chat/chat";
import { ChatMessage } from "../chat/chat-message/chat-message";
import { ChatSettingsRegistry } from "../chat/settings/chat-settings-registry";
import {
  LeaderboardResetPluginEventArguments,
} from "./plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";
import { NoArgumentsPluginEventArguments } from "./plugin-events/event-arguments/no-arguments-plugin-event-arguments";
import {
  PrePostMessagePluginEventArguments,
} from "./plugin-events/event-arguments/pre-post-message-plugin-event-arguments";
import {
  UserScoreChangedPluginEventArguments,
} from "./plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PluginEvent } from "./plugin-events/plugin-event-types";
import { AbstractPlugin } from "./plugin/plugin";

/**
 * Class exposing the Plugin Host concept. Plugins are managed by the Plugin Host.
 */
export class PluginHost {

  /**
   * Create a new Plugin Host.
   * The Plugin Host will not by itself try and
   * find compatible plugins. Instead, it requests
   * a list of plugins to be provided.
   * @param plugins List of plugins this PluginHost should manage.
   */
  constructor(public readonly plugins: AbstractPlugin[]) { }

  /* Overload List */
  public triggerEvent(event: PluginEvent.PreMesssage | PluginEvent.PostMessage,
                      input: PrePostMessagePluginEventArguments): string[];
  public triggerEvent(event: PluginEvent.UserScoreChange, input: UserScoreChangedPluginEventArguments): string[];
  public triggerEvent(event: PluginEvent.LeaderboardReset, input: LeaderboardResetPluginEventArguments): string[];
  public triggerEvent(event: PluginEvent.DankShutdown, input: NoArgumentsPluginEventArguments): string[];

  /**
   * Trigger a certain event on this Plugin Host's plugins.
   * @param event Event to trigger.
   * @param input Data input.
   */
  public triggerEvent(event: PluginEvent, input: any): string[] {
    let out: string[] = [];
    this.plugins.forEach((plugin) => {
      const output: string[] = plugin.triggerEvent(event, input);
      out = out.concat(output);
    });
    return out;
  }

  public triggerCommand(command: string, chat: Chat, chatmessage: ChatMessage): string[] {
    let out: string[] = [];
    this.plugins.forEach((plugin) => {
      const output: string[] = plugin.triggerCommand(command, chat, chatmessage);
      out = out.concat(output);
    });
    return out;
  }

  /**
   * Registers all chat setting templates defined by this host's plugins to
   * a supplied chat setting registry.
   * @param chatSettingsRegistry The chat setting registry to register this host's plugins to.
   */
  public registerPluginSettings(chatSettingsRegistry: ChatSettingsRegistry) {
    this.plugins.forEach((plugin) => plugin.getPluginSpecificChatSettings()
      .forEach((setting) => chatSettingsRegistry.registerChatSetting(setting)));
  }
}
