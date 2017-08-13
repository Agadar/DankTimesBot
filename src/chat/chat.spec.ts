import assert = require("assert");
import "mocha";
import * as moment from "moment-timezone";
import { User } from "../user/user";
import { Chat } from "./chat";

describe("Chat.hardcoreModeCheck", function() {
  const now = moment().unix();
  const nowMinus24Hours = now - (24 * 60 * 60);
  const nowMinusAlmost24Hours = nowMinus24Hours + 1;

  it("should not punish a user if hardcore mode is disabled", function() {
    const startingScore = 10;
    const user = new User(0, "user0", startingScore, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const chat = new Chat(0, "Europe/Amsterdam", true, 0, 10, 0, 0, users, [], [], false, 2, false, false, false);
    chat.hardcoreModeCheck(now);
    assert.equal(user.score, startingScore);
  });

  it("should not punish a user if hardcore mode is enabled but he scored in the last 24 hours", function() {
    const startingScore = 10;
    const user = new User(0, "user0", startingScore, nowMinusAlmost24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const chat = new Chat(0, "Europe/Amsterdam", true, 0, 10, 0, 0, users, [], [], false, 2, false, false, true);
    chat.hardcoreModeCheck(now);
    assert.equal(user.score, startingScore);
  });

  it("should punish a user if hardcore mode is enabled and he did not score in the last 24 hours", function() {
    const user = new User(0, "user0", 10, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const chat = new Chat(0, "Europe/Amsterdam", true, 0, 10, 0, 0, users, [], [], false, 2, false, false, true);
    chat.hardcoreModeCheck(now);
    assert.equal(user.score, 0);
  });
});
