import { Chat } from "../chat/chat";
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
                                        replyToMessageId: number, forceReply: boolean): void {
    /** */
  }
}
