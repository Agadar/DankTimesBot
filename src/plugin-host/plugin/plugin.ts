import { BotCommand } from "../../bot-commands/bot-command";
import { ChatSettingTemplate } from "../../chat/settings/chat-setting-template";
import {
  ChatMessageEventArguments,
} from "../plugin-events/event-arguments/chat-message-event-arguments";
import {
  EmptyEventArguments,
} from "../plugin-events/event-arguments/empty-event-arguments";
import {
  LeaderboardPostEventArguments,
} from "../plugin-events/event-arguments/leaderboard-post-event-arguments";
import { PostUserScoreChangedEventArguments } from "../plugin-events/event-arguments/post-user-score-changed-event-arguments";
import {
  PreUserScoreChangedEventArguments,
} from "../plugin-events/event-arguments/pre-user-score-changed-event-arguments";
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
   * Event triggers. Plugins can hook functions to certain Plugin Events.
   * These plugin events are defined in the PLUGIN_EVENT enumeration.
   */
  private pluginEventTriggers: Map<PluginEvent, (eventArgs: PluginEventArguments) => void>;
  /**
   * Listener to events fired by this plugin. Not to be confused with the
   * events this plugin listens to itself (i.e. the above pluginEventTriggers).
   */
  private listener: IPluginListener;

  /**
   * Create a new Plugin instance.
   * @param name Semantic name of this plugin.
   * @param version Version of this plugin.
   */
  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
    this.pluginEventTriggers = new Map<PluginEvent, (eventArgs: PluginEventArguments) => void>();
  }

  /**
   * Subscribes to this plugin to receive updates. Only one subscriber can be active at a time.
   */
  public subscribe(subscriber: IPluginListener): void {
    this.listener = subscriber;
  }

  /**
   * Trigger a certain PLUGIN_EVENT on this plugin. Called by PluginHost.
   * @param event PLUGIN_EVENT to trigger.
   */
  public triggerEvent(event: PluginEvent, eventArgs: PluginEventArguments): void {
    const fn = this.pluginEventTriggers.get(event);
    if (fn) {
      fn(eventArgs);
    }
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
                                   eventFn: (eventArgs: ChatMessageEventArguments) => void): void;
  protected subscribeToPluginEvent(event: PluginEvent.PreUserScoreChange,
                                   eventFn: (eventArgs: PreUserScoreChangedEventArguments) => void): void;
  protected subscribeToPluginEvent(event: PluginEvent.PostUserScoreChange,
                                   eventFn: (eventArgs: PostUserScoreChangedEventArguments) => void): void;
  protected subscribeToPluginEvent(event: PluginEvent.LeaderboardPost,
                                   eventFn: (eventArgs: LeaderboardPostEventArguments) => void): void;
  protected subscribeToPluginEvent(event: PluginEvent.BotStartup | PluginEvent.BotShutdown | PluginEvent.NightlyUpdate,
                                   eventFn: (eventArgs: EmptyEventArguments) => void): void;

  /**
   * Subscribe to a certain PLUGIN_EVENT.
   * @param _event Plugin event to describe to.
   * @param eventFn Function to execute when a certain event is triggered.
   */
  protected subscribeToPluginEvent<ArgumentsType extends PluginEventArguments>(
      event: PluginEvent, eventFn: (eventArgs: ArgumentsType) => void): void {
    this.pluginEventTriggers.set(event, eventFn);
  }

  /**
   * Sends a message to the Telegram Bot API.
   * @param chatId The id of the chat to send a message to.
   * @param htmlMessage The HTML message to send.
   * @param replyToMessageId The (optional) id of the message to reply to.
   * @param forceReply Whether to force the replied-to or tagged user to reply to this message.
   */
  protected sendMessage(chatId: number, htmlMessage: string, replyToMessageId = -1, forceReply = false): Promise<any> {
    return this.listener.onPluginWantsToSendChatMessage(chatId, htmlMessage, replyToMessageId, forceReply);
  }

  /**
   * Deletes a message via the Telegram Bot API.
   * @param chatId The id of the chat to delete a message in.
   * @param messageId The id of the message to delete.
   */
  protected deleteMessage(chatId: number, messageId: number): Promise<any> {
    return this.listener.onPluginWantsToDeleteChatMessage(chatId, messageId);
  }
}
