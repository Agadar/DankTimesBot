import { Chat } from "../chat/chat";
import { DankTime } from "../dank-time/dank-time";
import { IDankTimeScheduler } from "./i-dank-time-scheduler";

export class DankTimeSchedulerMock implements IDankTimeScheduler {

  public scheduleAllOfChat(chat: Chat): void {
    /**/
  }
  public scheduleDankTimesOfChat(chat: Chat): void {
    /**/
  }
  public scheduleRandomDankTimesOfChat(chat: Chat): void {
    /**/
  }
  public scheduleAutoLeaderboardsOfChat(chat: Chat): void {
    /**/
  }
  public unscheduleAllOfChat(chat: Chat): void {
    /**/
  }
  public unscheduleDankTimesOfChat(chat: Chat): void {
    /**/
  }
  public unscheduleRandomDankTimesOfChat(chat: Chat): void {
    /**/
  }
  public unscheduleAutoLeaderboardsOfChat(chat: Chat): void {
    /**/
  }
  public reset(): void {
    /**/
  }
  public unscheduleDankTime(chat: Chat, dankTime: DankTime): void {
    /**/
  }
  public unscheduleRandomDankTime(chat: Chat, dankTime: DankTime): void {
    /**/
  }
  public unscheduleAutoLeaderboard(chat: Chat, dankTime: DankTime): void {
    /**/
  }
  public scheduleDankTime(chat: Chat, dankTime: DankTime): void {
    /**/
  }
  public scheduleRandomDankTime(chat: Chat, dankTime: DankTime): void {
    /**/
  }
  public scheduleAutoLeaderboard(chat: Chat, dankTime: DankTime): void {
    /**/
  }
}
