import { BotCommand } from "../../bot-commands/bot-command";
import { Chat } from "../../chat/chat";
import { ChatSettingTemplate } from "../../chat/settings/chat-setting-template";
import {
  ChatMessagePluginEventArguments,
} from "../plugin-events/event-arguments/chat-message-plugin-event-arguments";
import {
  LeaderboardResetPluginEventArguments,
} from "../plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";
import {
  NoArgumentsPluginEventArguments,
} from "../plugin-events/event-arguments/no-arguments-plugin-event-arguments";
import {
  UserScoreChangedPluginEventArguments,
} from "../plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PluginEventArguments } from "../plugin-events/plugin-event-arguments";
import { PluginEvent } from "../plugin-events/plugin-event-types";
import { IPluginListener } from "./plugin-listener";

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
   * Internal plugin state.
   */
  protected data: any;

  /**
   * Event triggers. Plugins can hook functions to certain Plugin Events.
   * These plugin events are defined in the PLUGIN_EVENT enumeration.
   */
  private pluginEventTriggers: Map<PluginEvent, (data: any) => any>;

  /**
   * Listeners to events fired by this plugin. Not to be confused with the
   * events this plugin listens to itself (i.e. the above pluginEventTriggers).
   */
  private readonly listeners: IPluginListener[] = [];

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
  }

  /**
   * Subscribes to this plugin to receive updates.
   */
  public subscribe(subscriber: IPluginListener): void {
    if (this.listeners.indexOf(subscriber) === -1) {
      this.listeners.push(subscriber);
    }
  }

  /**
   * Trigger a certain PLUGIN_EVENT on this plugin. Called by PluginHost.
   * @param event PLUGIN_EVENT to trigger.
   */
  public triggerEvent(event: PluginEvent, data: PluginEventArguments): string[] {
    let output: string[] = [];

    if (this.pluginEventTriggers.has(event)) {
      output = output.concat((this.pluginEventTriggers.get(event) as (data: any) => any)(data));
    }

    return output;
  }

  /**
   * Gets this plugin's chat setting templates. Override this to add the plugin's settings
   * to the rest of danktimesbot's settings. These settings are then registered on
   * bot launch.
   * @returns This plugin's chat setting templates.
   */
  public getPluginSpecificChatSettings(): Array<ChatSettingTemplate<any>> {
    return [];
  }

  /**
   * Gets this plugin's commands. Override this to add the plugin's commands to the rest of
   * danktimesbot's commands. These commands are then registered on bot launch.
   * @returns This plugin's commands.
   */
  public getPluginSpecificCommands(): BotCommand[] {
    return [];
  }

  /* Function overload list */
  protected subscribeToPluginEvent(event: PluginEvent.ChatMessage,
                                   eventFn: (data: ChatMessagePluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.UserScoreChange,
                                   eventFn: (data: UserScoreChangedPluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.LeaderboardReset,
                                   eventFn: (data: LeaderboardResetPluginEventArguments) => any): void;
  protected subscribeToPluginEvent(event: PluginEvent.BotStartup | PluginEvent.BotShutdown,
                                   eventFn: (data: NoArgumentsPluginEventArguments) => any): void;

  /**
   * Subscribe to a certain PLUGIN_EVENT.
   * @param _event Plugin event to describe to.
   * @param eventFn Function to execute when a certain event is triggered.
   */
  protected subscribeToPluginEvent(event: PluginEvent, eventFn: (data: any) => any): void {
    this.pluginEventTriggers.set(event, eventFn);
  }

  /**
   * Sends a message to the Telegram Bot API.
   * @param chatId The id of the chat to send a message to.
   * @param htmlMessage The HTML message to send.
   * @param replyToMessageId The (optional) id of the message to reply to.
   * @param forceReply Whether to force the replied-to or tagged user to reply to this message.
   */
  protected sendMessage(chatId: number, htmlMessage: string, replyToMessageId = -1, forceReply = false) {
    this.listeners.forEach((listener) => listener
      .onPluginWantsToSendChatMessage(chatId, htmlMessage, replyToMessageId, forceReply));
  }
}
