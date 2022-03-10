import { CronJob } from "cron";
import { Chat } from "./chat/chat";
import { ContextRoot } from "./context-root";
import {
    EmptyEventArguments,
} from "./plugin-host/plugin-events/event-arguments/empty-event-arguments";
import { PluginEvent } from "./plugin-host/plugin-events/plugin-event-types";

/**
 * The over-arching component of DankTimesBot.
 */
export class Server {

    private nightlyUpdateCronJob: CronJob | null = null;
    private hourlyTickCronJob: CronJob | null = null;

    constructor(private readonly contextRoot: ContextRoot) { }

    public run(): void {

        // Schedule hourly ticks.
        this.scheduleHourlyTick();

        // Schedule to persist chats map to file on program exit.
        this.ensureChatsPersistenceOnExit();

        // Generate new random dank times and schedule everything.
        this.generateAndScheduleRandomDankTimes();

        // Generates random dank times daily for all chats and schedules notifications for them at every 00:00:00.
        // Also, punishes players that have not scored in the past 24 hours.
        this.scheduleNightlyUpdate();

        this.contextRoot.pluginHost.triggerEvent(PluginEvent.BotStartup, new EmptyEventArguments());

        // Send a release log message to all chats, assuming there are release logs.
        this.sendWhatsNewMessageIfApplicable();

        // Inform server.
        console.info(`Bot is now running! Version: ${this.contextRoot.version}`);
    }

    private scheduleHourlyTick(): void {
        this.hourlyTickCronJob = new CronJob("0 0 * * * *", () => {
            console.info("Doing hourly tick activities!");
            this.contextRoot.fileIO.saveDataToFile(this.contextRoot.backupFile, this.contextRoot.chatRegistry.chats);
            this.contextRoot.pluginHost.triggerEvent(PluginEvent.HourlyTick, new EmptyEventArguments());
        }, undefined, true, "UTC");
    }

    private ensureChatsPersistenceOnExit(): void {
        this.contextRoot.nodeCleanup((exitCode: number | null, signal: string | null) => {
            console.info("Persisting data to file before exiting...");
            this.contextRoot.fileIO.saveDataToFile(this.contextRoot.backupFile, this.contextRoot.chatRegistry.chats);
            this.contextRoot.pluginHost.triggerEvent(PluginEvent.BotShutdown, new EmptyEventArguments());
            return true;
        });
    }

    private generateAndScheduleRandomDankTimes(): void {
        this.contextRoot.chatRegistry.chats.forEach((chat: Chat) => {
            chat.generateRandomDankTimes();
            this.contextRoot.dankTimeScheduler.scheduleAllOfChat(chat);
        });
    }

    private scheduleNightlyUpdate(): void {
        this.nightlyUpdateCronJob = new CronJob("0 30 0 * * *", () => {
            console.info("Doing the nightly update!");
            this.contextRoot.danktimesbotController.doNightlyUpdate();
        }, undefined, true, "UTC");
    }

    private sendWhatsNewMessageIfApplicable(): void {
        if (this.contextRoot.config.sendWhatsNewMsg) {

            // Prepare message.
            const message = this.contextRoot.util.releaseLogToWhatsNewMessage(this.contextRoot.releaseLog);

            // Send it to all chats.
            this.contextRoot.chatRegistry.chats.forEach((chat: Chat) => {
                this.contextRoot.telegramClient.sendMessage(chat.id, message, -1, false);
            });

            // Update config so the what's new message is not sent on subsequent bot startups.
            this.contextRoot.config.sendWhatsNewMsg = false;
            this.contextRoot.fileIO.saveConfigToFile(this.contextRoot.config);
        }
    }
}
