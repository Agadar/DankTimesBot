import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../chat/chat";
import { CustomEventArguments } from "../plugin-host/plugin-events/event-arguments/custom-event-arguments";
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

  public onPluginWantsToSendChatMessage(chatId: number, htmlMessage: string,
                                        replyToMessageId: number, forceReply: boolean): Promise<void | TelegramBot.Message> {
    return Promise.resolve();
  }

  public onPluginWantsToDeleteChatMessage(chatId: number, messageId: number): Promise<void | boolean> {
    return Promise.resolve();
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
}
