import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { Chat } from "../chat/chat";
import { IDankTimeScheduler } from "../dank-time-scheduler/i-dank-time-scheduler";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { IDankTimesBotController } from "./i-danktimesbot-controller";

export class DankTimesBotController implements IDankTimesBotController {

  private readonly forbiddenStatusCode = 403;

  public constructor(
    private readonly moment: any,
    private readonly chatRegistry: IChatRegistry,
    private readonly dankTimeScheduler: IDankTimeScheduler,
    private readonly telegramClient: ITelegramClient,
    plugins: AbstractPlugin[],
  ) {
    this.chatRegistry.subscribe(this);
    this.telegramClient.subscribe(this);
    plugins.forEach((plugin) => plugin.subscribe(this));
  }

  /**
   * From ITelegramClientListener.
   */
  public onErrorFromApi(chatId: number, error: any): void {
    if (error.response.statusCode === this.forbiddenStatusCode) {
      const chat = this.chatRegistry.removeChat(chatId);

      if (chat) {
        this.dankTimeScheduler.unscheduleAllOfChat(chat);
      }
      console.info(`Bot was blocked by chat with id ${chatId}, removed corresponding chat data from bot!`);
    } else {
      console.error(error);  // Unknown error, print everything.
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
                                        replyToMessageId: number, forceReply: boolean): void {
    this.telegramClient.sendMessage(chatId, htmlMessage, replyToMessageId, forceReply);
  }

  public doNightlyUpdate(): void {
    const now = this.moment().unix();
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
  }
}
