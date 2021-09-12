import { BotCommandRegistry } from "../bot-commands/bot-command-registry";
import { ChatSettingsRegistry } from "../chat/settings/chat-settings-registry";
import {
  ChatMessageEventArguments,
} from "./plugin-events/event-arguments/chat-message-event-arguments";
import { EmptyEventArguments } from "./plugin-events/event-arguments/empty-event-arguments";
import {
  LeaderboardPostEventArguments,
} from "./plugin-events/event-arguments/leaderboard-post-event-arguments";
import { PostUserScoreChangedEventArguments } from "./plugin-events/event-arguments/post-user-score-changed-event-arguments";
import {
  PreUserScoreChangedEventArguments,
} from "./plugin-events/event-arguments/pre-user-score-changed-event-arguments";
import { PluginEventArguments } from "./plugin-events/plugin-event-arguments";
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
  public triggerEvent(event: PluginEvent.ChatMessage, input: ChatMessageEventArguments): void;
  public triggerEvent(event: PluginEvent.PreUserScoreChange, input: PreUserScoreChangedEventArguments): void;
  public triggerEvent(event: PluginEvent.PostUserScoreChange, input: PostUserScoreChangedEventArguments): void;
  public triggerEvent(event: PluginEvent.LeaderboardPost, input: LeaderboardPostEventArguments): void;
  public triggerEvent(event: PluginEvent.BotStartup | PluginEvent.BotShutdown | PluginEvent.NightlyUpdate |
    PluginEvent.HourlyTick, input: EmptyEventArguments): void;

  /**
   * Trigger a certain event on this Plugin Host's plugins.
   * @param event Event to trigger.
   * @param input Data input.
   */
  public triggerEvent(event: PluginEvent, input: PluginEventArguments): void {
    this.plugins.forEach((plugin) => {
      plugin.triggerEvent(event, input);
    });
  }

  /**
   * Registers all chat setting templates defined by this host's plugins to
   * a supplied chat setting registry.
   * @param chatSettingsRegistry The chat setting registry to register to.
   */
  public registerPluginSettings(chatSettingsRegistry: ChatSettingsRegistry) {
    this.plugins.forEach((plugin) => plugin.getPluginSpecificChatSettings()
      .forEach((setting) => chatSettingsRegistry.registerChatSetting(setting)));
  }

  /**
   * Registers all bot commands defined by this host's plugins to a supplied registry.
   * @param botCommandsRegistry The registry to register to.
   */
  public registerPluginCommands(botCommandsRegistry: BotCommandRegistry) {
    this.plugins.forEach((plugin) => plugin.getPluginSpecificCommands()
      .forEach((command) => botCommandsRegistry.registerCommand(command)));
  }
}
