import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../../chat/chat";
import { CustomEventArguments } from "../plugin-events/event-arguments/custom-event-arguments";
import { AbstractPlugin } from "./plugin";

/**
 * Listens to events fired by plugins.
 */
export interface IPluginListener {

    /**
     * Fired when a plugin wants to send a file / photo to a chat.
     * @param chatId Chat to send photo to
     * @param filePath Path to the file on disk to send
     * @param replyToMessageId Message to respond to
     * @param forceReply Whether to force the replied-to or tagged user to reply to this message
     * @param caption Optional caption
     * @param type Type of file to send
     */
    onPluginWantsToSendFile(chatId: number, filePath: string, replyToMessageId: number, forceReply: boolean, caption: string,
        type: "photo" | "video" | "audio" | "voice"): Promise<void | TelegramBot.Message>;

    /**
     * Fired when a plugin wants to delete a file. This is likely to be a photo.
     * @param chatId The id of the chat to retrieve a file from.
     * @param fileId Id of the file to retrieve.
     */
    onPluginWantsToRetrieveFile(chatId: number, fileId: string): Promise<string | void>;

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
    onPluginWantsToParseScoreInput(input: string, userScore: number | undefined): number | null;

    /**
     * Gets all plugins that are active and running except for the supplied one.
     */
    onPluginWantsToGetOtherPlugins(callingPlugin: AbstractPlugin): AbstractPlugin[];
}
