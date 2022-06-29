import moment from "moment";
import TelegramBot, { File } from "node-telegram-bot-api";
import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { Chat } from "../chat/chat";
import { IDankTimeScheduler } from "../dank-time-scheduler/i-dank-time-scheduler";
import { CustomEventArguments } from "../plugin-host/plugin-events/event-arguments/custom-event-arguments";
import { EmptyEventArguments } from "../plugin-host/plugin-events/event-arguments/empty-event-arguments";
import { PluginEvent } from "../plugin-host/plugin-events/plugin-event-types";
import { PluginHost } from "../plugin-host/plugin-host";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { FileIO } from "../util/file-io/file-io";
import { IUtil } from "../util/i-util";
import { IDankTimesBotController } from "./i-danktimesbot-controller";

export class DankTimesBotController implements IDankTimesBotController {

    private readonly forbiddenStatusCode = 403;
    private readonly requestNotFoundDescription = "Bad Request: chat not found";
    private readonly groupChatUpgradedDescription = "Bad Request: group chat was upgraded to a supergroup chat";

    public constructor(
        private readonly chatRegistry: IChatRegistry,
        private readonly dankTimeScheduler: IDankTimeScheduler,
        private readonly telegramClient: ITelegramClient,
        private readonly pluginHost: PluginHost,
        private readonly fileIO: FileIO,
        private readonly util: IUtil
    ) {
        this.chatRegistry.subscribe(this);
        this.telegramClient.subscribe(this);
        pluginHost.plugins.forEach((plugin) => plugin.subscribe(this));
    }

    /**
     * From ITelegramClientListener.
     */
    public onErrorFromApi(chatId: number, error: any): void {
        if (this.errorResponseWarrantsChatRemoval(error)) {
            const chat = this.chatRegistry.removeChat(chatId);

            if (chat) {
                this.dankTimeScheduler.unscheduleAllOfChat(chat);
            }
            console.info(`Bot was blocked by chat with id ${chatId}, removed corresponding chat data from bot!`);
        } else {
            console.info(`We received an unknown error. JSON-fied error object: ${JSON.stringify(error)}`);
        }
    }

    /**
     * From IChatRegistryListener.
     */
    public onChatCreated(chat: Chat): void {
        this.dankTimeScheduler.scheduleAllOfChat(chat);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToSendChatMessage(chatId: number, htmlMessage: string,
        replyToMessageId: number, forceReply: boolean, disableWebPagePreview: boolean): Promise<void | TelegramBot.Message> {
        return this.telegramClient.sendMessage(chatId, htmlMessage, replyToMessageId, forceReply, disableWebPagePreview);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToDeleteChatMessage(chatId: number, messageId: number): Promise<void | boolean> {
        return this.telegramClient.deleteMessage(chatId, messageId);
    }

    /**
     * From IPluginListener
     */
    onPluginWantsToEditChatMessage(chatId: number, messageId: number, newMessageText: string): Promise<void | boolean | TelegramBot.Message> {
        return this.telegramClient.editMessage(chatId, messageId, newMessageText);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToGetChat(chatId: number): Chat | null {
        return this.chatRegistry.chats.get(chatId) ?? null;
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToFireCustomEvent(event: CustomEventArguments): void {
        this.pluginHost.triggerEvent(PluginEvent.Custom, event);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToLoadData<T>(fileName: string): T | null {
        return this.fileIO.loadDataFromFile(fileName);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToLoadDataFromFileWithConverter<O, T>(fileName: string, converter: (parsed: O) => T): T | null {
        return this.fileIO.loadDataFromFileWithConverter(fileName, converter);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToSaveDataToFile<T>(fileName: string, data: T): void {
        this.fileIO.saveDataToFile(fileName, data);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToParseScoreInput(input: string): number | null {
        return this.util.parseScoreInput(input);
    }

    /**
     * From IPluginListener.
     */
    onPluginWantsToRetrieveFile(chatId: number, fileId: string): Promise<string | void> {
        return this.telegramClient.retrieveFile(chatId, fileId);
    }

    /**
     * From IPluginListener.
     */
    onPluginWantsToSendFile(chatId: number, filePath: string, replyToMessageId: number, forceReply: boolean): Promise<void | TelegramBot.Message> {
        return this.telegramClient.sendFile(chatId, filePath, replyToMessageId, forceReply);
    }

    /**
     * From IPluginListener.
     */
    public onPluginWantsToGetOtherPlugins(callingPlugin: AbstractPlugin): AbstractPlugin[] {
        return this.pluginHost.plugins.filter((plugin) => plugin !== callingPlugin);
    }

    public doNightlyUpdate(): void {
        const now = moment.now() / 1000;
        this.dankTimeScheduler.reset();

        this.chatRegistry.chats.forEach((chat: Chat) => {
            if (chat.running) {

                // Generate random dank times and reschedule everything.
                chat.generateRandomDankTimes();
                this.dankTimeScheduler.scheduleAllOfChat(chat);

                // Your punishment must be more severe!
                chat.hardcoreModeCheck(now);
            }
        });
        this.pluginHost.triggerEvent(PluginEvent.NightlyUpdate, new EmptyEventArguments());
    }

    private errorResponseWarrantsChatRemoval(error: any): boolean {
        return error && error.response && (error.response.statusCode === this.forbiddenStatusCode
            || (error.response.body && (error.response.body.description === this.requestNotFoundDescription ||
                error.response.body.description === this.groupChatUpgradedDescription)));
    }
}
