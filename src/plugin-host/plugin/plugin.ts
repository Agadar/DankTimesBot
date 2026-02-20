import TelegramBot from "node-telegram-bot-api";
import { BotCommand } from "../../bot-commands/bot-command";
import { Chat } from "../../chat/chat";
import { ChatSettingTemplate } from "../../chat/settings/chat-setting-template";
import { ChatInitialisationEventArguments } from "../plugin-events/event-arguments/chat-initialisation-event-arguments";
import { ChatMessageEventArguments } from "../plugin-events/event-arguments/chat-message-event-arguments";
import { CustomEventArguments } from "../plugin-events/event-arguments/custom-event-arguments";
import { EmptyEventArguments } from "../plugin-events/event-arguments/empty-event-arguments";
import { LeaderboardPostEventArguments } from "../plugin-events/event-arguments/leaderboard-post-event-arguments";
import { PostDankTimeEventArguments } from "../plugin-events/event-arguments/post-dank-time-event-arguments";
import { PostUserScoreChangedEventArguments } from "../plugin-events/event-arguments/post-user-score-changed-event-arguments";
import { PreDankTimeEventArguments } from "../plugin-events/event-arguments/pre-dank-time-event-arguments";
import { PreUserScoreChangedEventArguments } from "../plugin-events/event-arguments/pre-user-score-changed-event-arguments";
import { PluginEventArguments } from "../plugin-events/plugin-event-arguments";
import { PluginEventSubscription } from "../plugin-events/plugin-event-subscription";
import { PluginEvent } from "../plugin-events/plugin-event-types";
import { IPluginListener } from "./plugin-listener";
import { ChatResetEventArguments } from "../plugin-events/event-arguments/chat-reset-event-arguments";

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
     * Allows direct access to the Telegram Bot API e.g. for sending customized messages, files, stickers, and so forth.
     * Plugins are trusted not to override any of the listening/subscription behavior of DankTimesBot's core flow and to
     * properly take care of errors thrown by this client.
     */
    protected telegramBotClient: TelegramBot;

    /**
     * Event subcriptions. Plugins can hook functions to certain Plugin Events.
     * These plugin events are defined in the PLUGIN_EVENT enumeration.
     */
    private pluginEventSubscriptions: PluginEventSubscription[] = [];
    /**
     * Listener to events fired by this plugin. Not to be confused with the
     * events this plugin listens to itself (i.e. the above pluginEventSubscriptions).
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
    }

    /**
     * Subscribes to this plugin to receive updates. Only one subscriber can be active at a time.
     * Used internally for wiring this plugin to the required functionalities.
     */
    public subscribe(subscriber: IPluginListener): void {
        this.listener = subscriber;
    }

    /**
     * Sets this plugin's client to the Telegram Bot API.
     */
    public setTelegramBotClient(client: TelegramBot): void {
        this.telegramBotClient = client;
    }

    /**
     * Trigger a certain PLUGIN_EVENT on this plugin. Called by PluginHost.
     * @param event PLUGIN_EVENT to trigger.
     */
    public triggerEvent(event: PluginEvent, eventArgs: PluginEventArguments): void {

        const triggers = this.pluginEventSubscriptions.filter((trigger) => trigger.event === event &&
            (trigger.nameOfOriginPlugin === PluginEventSubscription.ANY_SOURCE_OR_REASON || trigger.nameOfOriginPlugin === eventArgs.nameOfOriginPlugin) &&
            (trigger.reason === PluginEventSubscription.ANY_SOURCE_OR_REASON || trigger.reason === eventArgs.reason));

        triggers.forEach((trigger) => {
            try {
                trigger.handler(eventArgs);
            } catch (error) {
                console.error(`Error while handling event ${PluginEvent[event]} for plugin ${this.name}: ${error}`);
            }
        });
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

    /**
     * Loads data from a file in the data folder. Data is expected
     * to be a simple struct or array/map thereof, as a simple JSON parse is used.
     * @param fileName Name of the file in the data folder.
     * @returns The loaded data, or null if no data found.
     */
    public loadDataFromFile<T>(fileName: string): T | null {
        return this.listener.onPluginWantsToLoadData(fileName);
    }

    /**
     * Loads data from a file in the data folder. Same functionality as
     * loadDataFromFile but allows supplying a converter to convert the
     * parsed data to a more complex type.
     * @param fileName Name of the file in the data folder.
     * @param converter Converter for raw structs to complex types.
     * @returns The loaded data, or null if no data found.
     */
    public loadDataFromFileWithConverter<O, T>(fileName: string, converter: (parsed: O) => T): T | null {
        return this.listener.onPluginWantsToLoadDataFromFileWithConverter(fileName, converter);
    }

    /**
     * Saves data to a file in the data folder. Data is expected to be a simple
     * struct (or array/map thereof) or have a public toJSON() function which will be used for stringifying.
     * @param fileName Name of the file in the data folder.
     * @param data The data to save to file.
     */
    public saveDataToFile<T>(fileName: string, data: T): void {
        return this.listener.onPluginWantsToSaveDataToFile(fileName, data);
    }

    /* Function overload list */
    protected subscribeToPluginEvent(event: PluginEvent.ChatInitialisation,
        eventFn: (eventArgs: ChatInitialisationEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.ChatMessage,
        eventFn: (eventArgs: ChatMessageEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.PreDankTime,
        eventFn: (eventArgs: PreDankTimeEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.PostDankTime,
        eventFn: (eventArgs: PostDankTimeEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.PreUserScoreChange,
        eventFn: (eventArgs: PreUserScoreChangedEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.PostUserScoreChange,
        eventFn: (eventArgs: PostUserScoreChangedEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.LeaderboardPost,
        eventFn: (eventArgs: LeaderboardPostEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.ChatReset,
        eventFn: (eventArgs: ChatResetEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.BotStartup | PluginEvent.BotShutdown | PluginEvent.NightlyUpdate
        | PluginEvent.HourlyTick, eventFn: (eventArgs: EmptyEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;
    protected subscribeToPluginEvent(event: PluginEvent.Custom,
        eventFn: (eventArgs: CustomEventArguments) => void, nameOfOriginPlugin?: string, reason?: string): void;

    /**
     * Subscribe to a certain PLUGIN_EVENT.
     * @param event Plugin event to subscribe to.
     * @param eventFn Function to execute when a certain event is triggered.
     * @param nameOfOriginPlugin The name of the plugin to accept these events from, or empty if wanting to accept events from DankTimesBot,
     * or star (*) to accept these events from any source. Star by default.
     * @param reason The reason to accept these events for, or star (*) to accept these events for any reason. Star by default.
     */
    protected subscribeToPluginEvent<ArgumentsType extends PluginEventArguments>(event: PluginEvent, eventFn: (eventArgs: ArgumentsType) => void,
        nameOfOriginPlugin?: string, reason?: string): void {
        const subscription = new PluginEventSubscription(eventFn, event, nameOfOriginPlugin, reason);
        this.pluginEventSubscriptions.push(subscription);
    }

    /**
     * Sends a file to the Telegram Bot API.
     * @param chatId The id of the chat to send a message to.
     * @param filePath The path to the file we want to send.
     * @param replyToMessageId The (optional) id of the message to reply to.
     * @param forceReply Whether to force the replied-to or tagged user to reply to this message.
     * @param caption Optional caption
     * @param type Type of file to send
     */
    protected sendFile(chatId: number, filePath: string, replyToMessageId = -1, forceReply = false, caption = "",
        type: "photo" | "video" | "audio" | "voice" = "photo"): Promise<void | TelegramBot.Message> {
        return this.listener.onPluginWantsToSendFile(chatId, filePath, replyToMessageId, forceReply, caption, type);
    }

    /**
     * Retrieves a file from the Telegram Bot API.
     * @param chatId The id of the chat to retrieve a file from.
     * @param fileId Id of the file to retrieve.
     */
    protected retrieveFile(chatId: number, fileId: string): Promise<string | void> {
        return this.listener.onPluginWantsToRetrieveFile(chatId, fileId);
    }

    /**
     * @deprecated Use this.telegramBotClient.sendMessage instead.
     */
    protected sendMessage(chatId: number, htmlMessage: string, replyToMessageId = -1, forceReply = false, disableWebPagePreview = false)
        : Promise<void | TelegramBot.Message> {
        const options: TelegramBot.SendMessageOptions = {
            parse_mode: "HTML",
            disable_web_page_preview: disableWebPagePreview
        };
        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
        if (forceReply) {
            options.reply_markup = {
                force_reply: true,
                selective: true,
            };
        }
        return this.telegramBotClient.sendMessage(chatId, htmlMessage, options);
    }

    /**
     * @deprecated Use this.telegramBotClient.editMessageText instead.
     */
    protected editMessage(chatId: number, messageId: number, newMessageText: string): Promise<boolean | void | TelegramBot.Message> {
        return this.telegramBotClient.editMessageText(newMessageText, { message_id: messageId, chat_id: chatId, parse_mode: "HTML" });
    }

    /**
     * @deprecated Use this.telegramBotClient.deleteMessage instead.
     */
    protected deleteMessage(chatId: number, messageId: number): Promise<boolean | void> {
        return this.telegramBotClient.deleteMessage(chatId, messageId);
    }

    /**
     * Gets the chat with the specified Id.
     * @param chatId The id of the chat to get.
     */
    protected getChat(chatId: number): Chat | null {
        return this.listener.onPluginWantsToGetChat(chatId);
    }

    /**
     * Parses the score input, returning a number if a number could be determined,
     * otherwise returns null.
     * @param input The string input to cleanse to a number.
     * @param userScore Optional user score. When supplied, this function can return values for texts such as 'all-in'.
     * @param previousInput Optional previous score input. When supplied, this function can return values for texts such as 'previous'.
     */
    protected parseScoreInput(input: string, userScore: number | undefined = undefined,
        previousInput: number | undefined = undefined): number | null {
        return this.listener.onPluginWantsToParseScoreInput(input, userScore, previousInput);
    }

    /**
     * Gets all other plugins that are active and running.
     */
    protected getOtherPlugins(): AbstractPlugin[] {
        return this.listener.onPluginWantsToGetOtherPlugins(this);
    }

    /**
     * Fires a custom plugin event to which other plugins can listen to.
     * @param reason The reason for the event.
     * @param eventData Any relevant event data. Consumers of these arguments will have
     * to cast/parse this and trust it is of the type they expect.
     */
    protected fireCustomEvent(reason?: string, eventData?: any): void {
        const event = new CustomEventArguments(this.name, reason, eventData);
        this.listener.onPluginWantsToFireCustomEvent(event);
    }
}
