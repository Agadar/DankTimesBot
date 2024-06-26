import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../chat/chat";
import { CustomEventArguments } from "../plugin-host/plugin-events/event-arguments/custom-event-arguments";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import { IDankTimesBotController } from "./i-danktimesbot-controller";

export class DankTimesBotControllerMock implements IDankTimesBotController {

    public doNightlyUpdateCalled = false;
    public onErrorFromApiCalledWith: { chatId: number, error: any } | null = null;
    public onChatCreatedCalledWith: Chat | null = null;

    public doNightlyUpdate(): void {
        this.doNightlyUpdateCalled = true;
    }

    public onErrorFromApi(chatId: number, error: any): void {
        this.onErrorFromApiCalledWith = {
            chatId,
            error,
        };
    }

    public onChatCreated(chat: Chat): void {
        this.onChatCreatedCalledWith = chat;
    }

    public onPluginWantsToGetChat(chatId: number): Chat | null {
        return null;
    }

    public onPluginWantsToFireCustomEvent(event: CustomEventArguments): void {
        // Do nothing.
    }

    public onPluginWantsToLoadData<T>(fileName: string): T | null {
        return null;
    }

    public onPluginWantsToLoadDataFromFileWithConverter<O, T>(fileName: string, converter: (parsed: O) => T): T | null {
        return null;
    }

    public onPluginWantsToSaveDataToFile<T>(fileName: string, data: T): void {
        // Do nothing.
    }

    public onPluginWantsToParseScoreInput(input: string, userScore: number | undefined = undefined,
        previousInput: number | undefined = undefined): number | null {
        return null;
    }

    public onPluginWantsToGetOtherPlugins(callingPlugin: AbstractPlugin): AbstractPlugin[] {
        return [];
    }

    public onPluginWantsToRetrieveFile(chatId: number, fileId: string): Promise<string | void> {
        return Promise.resolve();
    }

    public onPluginWantsToSendFile(chatId: number, filePath: string, replyToMessageId: number, forceReply: boolean, type: "photo" | "video")
        : Promise<void | TelegramBot.Message> {
        return Promise.resolve();
    }
}
