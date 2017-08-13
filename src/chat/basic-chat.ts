import { BasicUser } from "../user/basic-user";
import { BasicDankTime } from "../dank-time/basic-dank-time";

export interface BasicChat {
  id: number,
  timezone: string,
  running: boolean,
  numberOfRandomTimes: number,
  pointsPerRandomTime: number,
  lastHour: number,
  lastMinute: number,
  users: BasicUser[],
  dankTimes: BasicDankTime[],
  notifications: boolean,
  multiplier: number,
  autoLeaderboards: boolean,
  firstNotifications: boolean
}