import { IDankTimesBotCommandsRegistrar } from "./bot-commands/i-danktimesbot-commands-registrar";
import { IChatRegistry } from "./chat-registry/i-chat-registry";
import { Chat } from "./chat/chat";
import { IDankTimeScheduler } from "./dank-time-scheduler/i-dank-time-scheduler";
import { Config } from "./misc/config";
import { Release } from "./misc/release";
import { ITelegramClient } from "./telegram-client/i-telegram-client";
import { IFileIO } from "./util/file-io/i-file-io";

export class Server {

  private dailyUpdate = null;

  constructor(
    private readonly fileIO: IFileIO,
    private readonly chatRegistry: IChatRegistry,
    private readonly releaseLog: Release[],
    private readonly telegramClient: ITelegramClient,
    private readonly scheduler: IDankTimeScheduler,
    private readonly config: Config,
    private readonly nodeCleanup: any,
    private readonly moment: any,
    private readonly cronJob: any,
    private readonly dankTimesBotCommandsRegistrar: IDankTimesBotCommandsRegistrar,
  ) { }

  public run(): void {

    // Register available Telegram bot commands.
    this.dankTimesBotCommandsRegistrar.registerDankTimesBotCommands();

    // Schedule to persist chats map to file every X minutes.
    this.scheduleChatsPersistence();

    // Schedule to persist chats map to file on program exit.
    this.ensureChatsPersistenceOnExit();

    // Generate new random dank times and schedule everything.
    this.generateAndScheduleRandomDankTimes();

    // Generates random dank times daily for all chats and schedules notifications for them at every 00:00:00.
    // Also, punishes players that have not scored in the past 24 hours.
    this.scheduleNightlyUpdates();

    // Send a release log message to all chats, assuming there are release logs.
    this.sendWhatsNewMessageIfApplicable();

    // Inform server.
    console.info("Bot is now running!");
  }

  private scheduleChatsPersistence(): void {
    setInterval(() => {
      this.fileIO.saveChatsToFile(this.chatRegistry.chats);
      console.info("Persisted data to file.");
    }, this.config.persistenceRate * 60 * 1000);
  }

  private ensureChatsPersistenceOnExit(): void {
    this.nodeCleanup((exitCode: number | null, signal: string | null) => {
      console.info("Persisting data to file before exiting...");
      this.fileIO.saveChatsToFile(this.chatRegistry.chats);
      return true;
    });
  }

  private generateAndScheduleRandomDankTimes(): void {
    this.chatRegistry.chats.forEach((chat: Chat) => {
      chat.generateRandomDankTimes();
      this.scheduler.scheduleAllOfChat(chat);
    });
  }

  private scheduleNightlyUpdates(): void {
    this.dailyUpdate = new this.cronJob("0 0 0 * * *", () => {
      console.info("Generating random dank times for all chats and punishing"
        + " users that haven't scored in the past 24 hours!");
      const now = this.moment().unix();
      this.chatRegistry.chats.forEach((chat: Chat) => {
        if (chat.running) {

          // Unschedule
          this.scheduler.unscheduleRandomDankTimesOfChat(chat);
          this.scheduler.unscheduleAutoLeaderboardsOfChat(chat);

          // Generate random dank times
          chat.generateRandomDankTimes();

          // Reschedule
          this.scheduler.scheduleRandomDankTimesOfChat(chat);
          this.scheduler.scheduleAutoLeaderboardsOfChat(chat);

          // Your punishment must be more severe!
          chat.hardcoreModeCheck(now);
        }
      });
    }, undefined, true);
  }

  private sendWhatsNewMessageIfApplicable(): void {
    if (this.config.sendWhatsNewMsg && this.releaseLog.length > 0) {

      // Prepare message.
      let message = `<b>--- What's new in version ${this.releaseLog[0].version} ? ---</b>\n\n`;
      this.releaseLog[0].changes.forEach((change) => {
        message += `- ${change}\n`;
      });

      // Send it to all chats.
      this.chatRegistry.chats.forEach((chat: Chat) => {
        this.telegramClient.sendMessage(chat.id, message);
      });

      // Update config so the what's new message is not sent on subsequent bot startups.
      this.config.sendWhatsNewMsg = false;
      this.fileIO.saveConfigToFile(this.config);
    }
  }
}
