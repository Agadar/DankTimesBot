import TelegramBot, { File, PhotoSize } from "node-telegram-bot-api";
import { Chat } from "../../chat/chat";
import { CustomEventArguments } from "../plugin-events/event-arguments/custom-event-arguments";
import { AbstractPlugin } from "./plugin";

/**
 * Listens to events fired by plugins.
 */
export interface IPluginListener {

    /**
     * Fired when a plugin wants to send a chat message.
     * @param chatId The id of the chat to send a message to.
     * @param htmlMessage The HTML message to send.
     * @param replyToMessageId The (optional) id of the message to reply to.
     * @param forceReply Whether to force the replied-to or tagged user to reply to this message.
     */
    onPluginWantsToSendChatMessage(chatId: number, htmlMessage: string,
                                   replyToMessageId: number, forceReply: boolean, disableWebPagePreview: boolean): Promise<void | TelegramBot.Message>;

    /**
     * Fired when a plugin wants to send a file / photo to a chat.
     * @param chatId Chat to send photo to
     * @param filePath Path to the file on disk to send
     * @param replyToMessageId Message to respond to
     * @param forceReply Whether to force the replied-to or tagged user to reply to this message
     */
    onPluginWantsToSendFile(chatId: number, filePath: string, replyToMessageId: number, forceReply: boolean): Promise<void | TelegramBot.Message>;

    /**
     * Fired when a plugin wants to delete a chat message.
     * @param chatId The id of the chat to delete a message in.
     * @param messageId The id of the message to delete.
     */
    onPluginWantsToDeleteChatMessage(chatId: number, messageId: number): Promise<void | boolean>;

    /**
     * Fired when a plugin wants to delete a file. This is likely to be a photo.
     * @param chatId The id of the chat to retrieve a file from.
     * @param fileId Id of the file to retrieve.
     */
    onPluginWantsToRetrieveFile(chatId: number, fileId: string): Promise<string | void>;

    /**
     * Fired when a plugin wants to edit a chat message.
     * @param chatId The id of the chat to edit a message in.
     * @param messageId The id of the message to edit.
     * @param newMessageText New message.
     */
    onPluginWantsToEditChatMessage(chatId: number, messageId: number, newMessageText: string): Promise<void | boolean | TelegramBot.Message>;

    /**
     * Fired when a plugin wants to get a chat.
     * @param chatId The id of the chat to get.
     */
    onPluginWantsToGetChat(chatId: number): Chat | null;

    /**
     * Fired when a plugin wants to fire a custom event.
     * @param event The custom event the plugin wants to fire.
     */
    onPluginWantsToFireCustomEvent(event: CustomEventArguments): void;

    /**
     * See FileIO.loadDataFromFile
     */
    onPluginWantsToLoadData<T>(fileName: string): T | null;

    /**
     * See FileIO.loadDataFromFileWithConverter
     */
    onPluginWantsToLoadDataFromFileWithConverter<O, T>(fileName: string, converter: (parsed: O) => T): T | null;

    /**
     * See FileIO.saveDataToFile
     */
    onPluginWantsToSaveDataToFile<T>(fileName: string, data: T): void;

    /**
     * See Util.parseScoreInput
     */
    onPluginWantsToParseScoreInput(input: string): number | null;

    /**
     * Gets all plugins that are active and running except for the supplied one.
     */
    onPluginWantsToGetOtherPlugins(callingPlugin: AbstractPlugin): AbstractPlugin[];
}
