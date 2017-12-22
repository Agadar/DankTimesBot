import { Chat } from "../chat/chat";
import { DankTime } from "../dank-time/dank-time";
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
  public autoLeaderBoards = new Array<ScheduledItem>();

  constructor(
    private readonly tgClient: ITelegramClient,
    private readonly cronJob: any) { }

  /**
   * Schedules all normal and random dank times notifications and auto-leaderboards of a chat.
   */
  public scheduleAllOfChat(chat: Chat): void {

    // If the chat ain't running, schedule nothing.
    if (!chat.running) {
      return;
    }

    // Schedule RANDOM dank time notifications.
    this.scheduleRandomDankTimesOfChat(chat);

    // Schedule NORMAL dank time notifications, if desired.
    if (chat.notifications) {
      this.scheduleDankTimesOfChat(chat);
    }

    // Schedule auto-leaderboards, if desired.
    if (chat.autoLeaderboards) {
      this.scheduleAutoLeaderboardsOfChat(chat);
    }
  }

  /**
   * Schedules all NORMAL dank time notifications of a chat. Does NOT verify chat settings.
   */
  public scheduleDankTimesOfChat(chat: Chat): void {
    chat.dankTimes.forEach((dankTime) => {
      this.scheduleDankTime(chat, dankTime);
    });
  }

  /**
   * Schedules all RANDOM dank time notifications of a chat. Does NOT verify chat settings.
   */
  public scheduleRandomDankTimesOfChat(chat: Chat): void {
    chat.randomDankTimes.forEach((dankTime) => {
      this.scheduleRandomDankTime(chat, dankTime);
    });
  }

  /**
   * Schedules all auto-leaderboard posts of a chat. Does NOT verify chat settings.
   */
  public scheduleAutoLeaderboardsOfChat(chat: Chat): void {
    chat.randomDankTimes.forEach((dankTime) => {
      this.scheduleAutoLeaderboard(chat, dankTime);
    });
    chat.dankTimes.forEach((dankTime) => {
      this.scheduleAutoLeaderboard(chat, dankTime);
    });
  }

  /**
   * Unschedules all normal and random dank time notifications and auto-leaderboards of a chat.
   */
  public unscheduleAllOfChat(chat: Chat): void {
    this.unscheduleDankTimesOfChat(chat);
    this.unscheduleRandomDankTimesOfChat(chat);
    this.unscheduleAutoLeaderboardsOfChat(chat);
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
   * Unschedules all auto-leaderboard posts of a chat.
   */
  public unscheduleAutoLeaderboardsOfChat(chat: Chat): void {
    this.unscheduleCronJobsOfChat(chat, this.autoLeaderBoards);
  }

  /**
   * Resets this scheduler completely, unscheduling all jobs and emptying the job lists.
   */
  public reset(): void {
    this.dankTimeNotifications.forEach((job) => job.cronJob.stop());
    this.dankTimeNotifications = [];
    this.autoLeaderBoards.forEach((job) => job.cronJob.stop());
    this.autoLeaderBoards = [];
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
   * Unschedules a the auto-posting of a leaderboard 1 minute after a dank time.
   */
  public unscheduleAutoLeaderboard(chat: Chat, dankTime: DankTime): void {
    this.unscheduleCronJob(chat, dankTime, this.autoLeaderBoards);
  }

  /**
   * Schedules a notification for a NORMAL dank time. Does NOT verify chat settings.
   */
  public scheduleDankTime(chat: Chat, dankTime: DankTime): void {
    const thisRef = this;
    this.dankTimeNotifications.push({
      chatId: chat.id,
      cronJob: new this.cronJob("0 " + dankTime.minute + " " + dankTime.hour + " * * *", () => {
        if (chat.running && chat.notifications) {
          thisRef.tgClient.sendMessage(chat.id, "⏰ It's dank o'clock! Type '" + dankTime.texts[0] + "' for points!");
        }
      }, undefined, true, chat.timezone),
      hour: dankTime.hour,
      minute: dankTime.minute,
    });
  }

  /**
   * Schedules a notification for a RANDOM dank time. Does NOT verify chat settings.
   */
  public scheduleRandomDankTime(chat: Chat, dankTime: DankTime): void {
    const thisRef = this;
    this.randomDankTimeNotifications.push({
      chatId: chat.id,
      cronJob: new this.cronJob("0 " + dankTime.minute + " " + dankTime.hour + " * * *", () => {
        if (chat.running) {
          thisRef.tgClient.sendMessage(chat.id, "🙀 Surprise dank time! Type '" + dankTime.texts[0] + "' for points!");
        }
      }, undefined, true, chat.timezone),
      hour: dankTime.hour,
      minute: dankTime.minute,
    });
  }

  /**
   * Schedules the auto-posting of a leaderboard 1 minute after a dank time. Does NOT verify chat settings.
   */
  public scheduleAutoLeaderboard(chat: Chat, dankTime: DankTime): void {
    let minute = dankTime.minute + 1;
    let hour = dankTime.hour;

    // Correct if minute + 1 is 60.
    if (minute >= 60) {
      minute = 0;
      hour++;

      // Correct if hour is 24.
      if (hour >= 24) {
        hour = 0;
      }
    }

    // Schedule the cron job.
    const thisRef = this;
    this.autoLeaderBoards.push({
      chatId: chat.id,
      cronJob: new this.cronJob("0 " + minute + " " + hour + " * * *", () => {
        if (chat.running && chat.autoLeaderboards && chat.leaderboardChanged()) {
          thisRef.tgClient.sendMessage(chat.id, chat.generateLeaderboard());
        }
      }, undefined, true, chat.timezone),
      hour: dankTime.hour,
      minute: dankTime.minute,
    });
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
