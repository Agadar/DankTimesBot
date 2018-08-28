import { Chat } from "../chat/chat";
import { DankTime } from "../dank-time/dank-time";

/**
 * Responsible for scheduling notification messages about dank times.
 */
export interface IDankTimeScheduler {

  /**
   * Schedules all normal and random dank times notifications and auto-leaderboards of a chat.
   */
  scheduleAllOfChat(chat: Chat): void;

  /**
   * Schedules all NORMAL dank time notifications of a chat. Does NOT verify chat settings.
   */
  scheduleDankTimesOfChat(chat: Chat): void;

  /**
   * Schedules all RANDOM dank time notifications of a chat. Does NOT verify chat settings.
   */
  scheduleRandomDankTimesOfChat(chat: Chat): void;

  /**
   * Unschedules all normal and random dank time notifications and auto-leaderboards of a chat.
   */
  unscheduleAllOfChat(chat: Chat): void;

  /**
   * Unschedules all NORMAL dank time notifications of a chat.
   */
  unscheduleDankTimesOfChat(chat: Chat): void;

  /**
   * Unschedules all RANDOM dank time notifications of a chat.
   */
  unscheduleRandomDankTimesOfChat(chat: Chat): void;

  /**
   * Resets this scheduler completely, unscheduling all jobs and emptying the job lists.
   */
  reset(): void;

  /**
   * Unschedules a NORMAL dank time notification.
   */
  unscheduleDankTime(chat: Chat, dankTime: DankTime): void;

  /**
   * Unschedules a RANDOM dank time notification.
   */
  unscheduleRandomDankTime(chat: Chat, dankTime: DankTime): void;

  /**
   * Schedules a notification for a NORMAL dank time. Does NOT verify chat settings.
   */
  scheduleDankTime(chat: Chat, dankTime: DankTime): void;

  /**
   * Schedules a notification for a RANDOM dank time. Does NOT verify chat settings.
   */
  scheduleRandomDankTime(chat: Chat, dankTime: DankTime): void;
}
