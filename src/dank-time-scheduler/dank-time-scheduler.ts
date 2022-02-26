import { CronJob } from "cron";
import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { DankTime } from "../dank-time/dank-time";
import { PostDankTimeEventArguments } from "../plugin-host/plugin-events/event-arguments/post-dank-time-event-arguments";
import { PreDankTimeEventArguments } from "../plugin-host/plugin-events/event-arguments/pre-dank-time-event-arguments";
import { PluginEvent } from "../plugin-host/plugin-events/plugin-event-types";
import { PluginHost } from "../plugin-host/plugin-host";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { IDankTimeScheduler } from "./i-dank-time-scheduler";

interface ScheduledItem {
  chatId: number;
  hour: number;
  minute: number;
  cronJob: any;
}

/**
 * Responsible for scheduling notification messages about dank times.
 */
export class DankTimeScheduler implements IDankTimeScheduler {

  public randomDankTimeNotifications = new Array<ScheduledItem>();
  public dankTimeNotifications = new Array<ScheduledItem>();

  constructor(private readonly tgClient: ITelegramClient, private readonly pluginHost: PluginHost) { }

  /**
   * Schedules all normal and random dank times notifications of a chat.
   */
  public scheduleAllOfChat(chat: Chat): void {
    if (!chat.running) { return; }
    this.scheduleRandomDankTimesOfChat(chat);
    this.scheduleDankTimesOfChat(chat);
  }

  /**
   * Schedules all NORMAL dank time notifications of a chat.
   */
  public scheduleDankTimesOfChat(chat: Chat): void {
    chat.dankTimes.forEach((dankTime) => {
      this.scheduleDankTime(chat, dankTime);
    });
  }

  /**
   * Schedules all RANDOM dank time notifications of a chat.
   */
  public scheduleRandomDankTimesOfChat(chat: Chat): void {
    chat.randomDankTimes.forEach((dankTime) => {
      this.scheduleRandomDankTime(chat, dankTime);
    });
  }

  /**
   * Unschedules all normal and random dank time notifications and auto-leaderboards of a chat.
   */
  public unscheduleAllOfChat(chat: Chat): void {
    this.unscheduleDankTimesOfChat(chat);
    this.unscheduleRandomDankTimesOfChat(chat);
  }

  /**
   * Unschedules all NORMAL dank time notifications of a chat.
   */
  public unscheduleDankTimesOfChat(chat: Chat): void {
    this.unscheduleCronJobsOfChat(chat, this.dankTimeNotifications);
  }

  /**
   * Unschedules all RANDOM dank time notifications of a chat.
   */
  public unscheduleRandomDankTimesOfChat(chat: Chat): void {
    this.unscheduleCronJobsOfChat(chat, this.randomDankTimeNotifications);
  }

  /**
   * Resets this scheduler completely, unscheduling all jobs and emptying the job lists.
   */
  public reset(): void {
    this.dankTimeNotifications.forEach((job) => job.cronJob.stop());
    this.dankTimeNotifications = [];
    this.randomDankTimeNotifications.forEach((job) => job.cronJob.stop());
    this.randomDankTimeNotifications = [];
  }

  /**
   * Unschedules a NORMAL dank time notification.
   */
  public unscheduleDankTime(chat: Chat, dankTime: DankTime): void {
    this.unscheduleCronJob(chat, dankTime, this.dankTimeNotifications);
  }

  /**
   * Unschedules a RANDOM dank time notification.
   */
  public unscheduleRandomDankTime(chat: Chat, dankTime: DankTime): void {
    this.unscheduleCronJob(chat, dankTime, this.randomDankTimeNotifications);
  }

  /**
   * Schedules a notification for a NORMAL dank time.
   */
  public scheduleDankTime(chat: Chat, dankTime: DankTime): void {
    this.dankTimeNotifications.push({
      chatId: chat.id,
      cronJob: new CronJob("0 " + dankTime.minute + " " + dankTime.hour + " * * *", (() => {
        if (!chat || !chat.running) { return; }
        let promise;
        if (chat.normaltimesNotifications) {
          const messageText = `⏰ It's dank o'clock! Type '${dankTime.texts[0]}' for points!`;
          promise = this.sendAnnouncement(chat.id, messageText);
        }
        this.schedulePostDankTimeActions(chat, dankTime, promise);
        const preDankTimeEventArgs = new PreDankTimeEventArguments(chat, dankTime);
        this.pluginHost.triggerEvent(PluginEvent.PreDankTime, preDankTimeEventArgs);
      }).bind(this), undefined, true, chat.timezone),
      hour: dankTime.hour,
      minute: dankTime.minute,
    });
  }

  /**
   * Schedules a notification for a RANDOM dank time.
   */
  public scheduleRandomDankTime(chat: Chat, dankTime: DankTime): void {
    this.randomDankTimeNotifications.push({
      chatId: chat.id,
      cronJob: new CronJob("0 " + dankTime.minute + " " + dankTime.hour + " * * *", (() => {
        if (!chat || !chat.running) { return; }
        const messageText = `🙀 Surprise dank time! Type '${dankTime.texts[0]}' for points!`;
        const promise = this.sendAnnouncement(chat.id, messageText);
        this.schedulePostDankTimeActions(chat, dankTime, promise);
        const preDankTimeEventArgs = new PreDankTimeEventArguments(chat, dankTime);
        this.pluginHost.triggerEvent(PluginEvent.PreDankTime, preDankTimeEventArgs);
      }).bind(this), undefined, true, chat.timezone),
      hour: dankTime.hour,
      minute: dankTime.minute,
    });
  }

  private sendAnnouncement(chatId: number, messageText: string): Promise<void | TelegramBot.Message> {
    return this.tgClient.sendMessage(chatId, messageText, -1, false);
  }

  private schedulePostDankTimeActions(chat: Chat, dankTime: DankTime, sendAnnouncementPromise?: Promise<void | TelegramBot.Message>) {
    setTimeout((() => {
      if (!chat || !chat.running) { return; }
      let lastDankTimeScorers = new Array<User>();

      if (chat.lastDankTime === dankTime) {
        if (chat.autoleaderboards) {
          this.sendLeaderboard(chat);
        }
        lastDankTimeScorers = chat.lastDankTimeScorers;
      } else if (sendAnnouncementPromise) {
        sendAnnouncementPromise.then((res) => {
          if (chat && res?.message_id) {
            this.removeAnnouncement(chat.id, res.message_id);
          }
        });
      }
      const postDankTimeEventArgs = new PostDankTimeEventArguments(chat, dankTime, lastDankTimeScorers);
      this.pluginHost.triggerEvent(PluginEvent.PostDankTime, postDankTimeEventArgs);
    }).bind(this), 59000);
  }

  private sendLeaderboard(chat: Chat) {
    const leaderboard = chat.generateLeaderboard();
    this.tgClient.sendMessage(chat.id, leaderboard, -1, false);
  }

  private removeAnnouncement(chatId: number, messageId: number) {
    this.tgClient.deleteMessage(chatId, messageId);
  }

  /**
   * Unschedules all cron jobs in the supplied array belonging to the specified chat.
   */
  private unscheduleCronJobsOfChat(chat: Chat, cronJobs: ScheduledItem[]): void {
    let i = cronJobs.length;
    while (i--) {
      const job = cronJobs[i];
      if (job.chatId === chat.id) {
        job.cronJob.stop();
        cronJobs.splice(i, 1);
      }
    }
  }

  /**
   * Unschedules and removes the cronjob from the supplied array that belongs to the specified Chat and DankTime.
   */
  private unscheduleCronJob(chat: Chat, dankTime: DankTime, cronJobs: ScheduledItem[]): void {
    let i = cronJobs.length;
    while (i--) {
      const job = cronJobs[i];
      if (job.chatId === chat.id && job.hour === dankTime.hour && job.minute === dankTime.minute) {
        job.cronJob.stop();
        cronJobs.splice(i, 1);
        return;
      }
    }
  }
}
