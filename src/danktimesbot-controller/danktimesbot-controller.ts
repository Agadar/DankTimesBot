import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { Chat } from "../chat/chat";
import { IDankTimeScheduler } from "../dank-time-scheduler/i-dank-time-scheduler";
import { EmptyEventArguments } from "../plugin-host/plugin-events/event-arguments/empty-event-arguments";
import { PluginEvent } from "../plugin-host/plugin-events/plugin-event-types";
import { PluginHost } from "../plugin-host/plugin-host";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { IDankTimesBotController } from "./i-danktimesbot-controller";

export class DankTimesBotController implements IDankTimesBotController {

  private readonly forbiddenStatusCode = 403;
  private readonly requestNotFoundDescription = "Bad Request: chat not found";
  private readonly groupChatUpgradedDescription = "Bad Request: group chat was upgraded to a supergroup chat";

  public constructor(
    private readonly moment: any,
    private readonly chatRegistry: IChatRegistry,
    private readonly dankTimeScheduler: IDankTimeScheduler,
    private readonly telegramClient: ITelegramClient,
    private readonly pluginHost: PluginHost,
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
                                        replyToMessageId: number, forceReply: boolean): Promise<any> {
    return this.telegramClient.sendMessage(chatId, htmlMessage, replyToMessageId, forceReply);
  }

  /**
   * From IPluginListener.
   */
  public onPluginWantsToDeleteChatMessage(chatId: number, messageId: number): Promise<any> {
    return this.telegramClient.deleteMessage(chatId, messageId);
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
    this.pluginHost.triggerEvent(PluginEvent.NightlyUpdate, new EmptyEventArguments());
  }

  private errorResponseWarrantsChatRemoval(error: any): boolean {
    return error && error.response && (error.response.statusCode === this.forbiddenStatusCode
      || (error.response.body && (error.response.body.description === this.requestNotFoundDescription ||
        error.response.body.description === this.groupChatUpgradedDescription)));
  }
}
