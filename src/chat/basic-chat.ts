import { BasicDankTime } from "../dank-time/basic-dank-time";
import { BasicUser } from "./user/basic-user";

export interface BasicChat {
  id: number;
  running: boolean;
  lastHour: number;
  lastMinute: number;
  users: BasicUser[];
  dankTimes: BasicDankTime[];
  settings: Array<{
    name: string;
    value: any;
  }>;
}
