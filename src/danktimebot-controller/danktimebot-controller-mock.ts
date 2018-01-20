import { Chat } from "../chat/chat";
import { IDankTimeBotController } from "./i-danktimebot-controller";

export class DankTimeBotControllerMock implements IDankTimeBotController {

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
}
