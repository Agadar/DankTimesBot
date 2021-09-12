import { assert } from "chai";
import "mocha";
import * as moment from "moment-timezone";
import TelegramBot from "node-telegram-bot-api";

import { Chat } from "../../chat/chat";
import { ChatSetting } from "../../chat/settings/chat-setting";
import { User } from "../../chat/user/user";
import { DankTimeSchedulerMock } from "../../dank-time-scheduler/dank-time-scheduler-mock";
import { PluginHost } from "../../plugin-host/plugin-host";
import { Util } from "../../util/util";
import { BotCommandRegistry } from "../bot-command-registry";
import { DankTimesBotCommands } from "./danktimesbot-commands";

describe("DankTimesBotCommands.addTime", () => {

  let dankTimesBotCommands: DankTimesBotCommands;
  const scheduler = new DankTimeSchedulerMock();
  const util = new Util();
  const commandRegistryMock = {} as BotCommandRegistry;
  let chat: Chat;
  const msg: TelegramBot.Message = {
    chat: {
      id: 0,
      type: "private",
    },
    date: moment.now() / 1000,
    message_id: 0,
  };
  let match: string = "";

  beforeEach("Instantiate test variables", () => {
    dankTimesBotCommands = new DankTimesBotCommands(commandRegistryMock, scheduler, util, []);
    chat = new Chat(util, 0, new PluginHost([]), new Map<string, ChatSetting<any>>());
    match = "22 33 5";
    chat.dankTimes.splice(0);
  });

  it("Should create a dank time with as text a single word", () => {

    // Arrange
    match += " one";

    // Act
    const res = dankTimesBotCommands.addTime(chat, {} as User, msg, match);

    // Assert
    assert.equal(res, "⏰ Added the new time!");
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["one"]);
  });

  it("Should create a dank time with as text a single sentence", () => {

    // Arrange
    match += " abc def ghi";

    // Act
    const res = dankTimesBotCommands.addTime(chat, {} as User, msg, match);

    // Assert
    assert.equal(res, "⏰ Added the new time!");
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["abc def ghi"]);
  });

  it("Should create a dank time with as texts multiple single words", () => {

    // Arrange
    match += " one, two , three";

    // Act
    const res = dankTimesBotCommands.addTime(chat, {} as User, msg, match);

    // Assert
    assert.equal(res, "⏰ Added the new time!");
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["one", "two", "three"]);
  });

  it("Should create a dank time with as texts multiple sentences", () => {

    // Arrange
    match += " abc def, ghi jkl , mno pqr";

    // Act
    const res = dankTimesBotCommands.addTime(chat, {} as User, msg, match);

    // Assert
    assert.equal(res, "⏰ Added the new time!");
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["abc def", "ghi jkl", "mno pqr"]);
  });

  it("Should create a dank time with as texts a mixture of single words and sentences", () => {

    // Arrange
    match += " abc def, one , two";

    // Act
    const res = dankTimesBotCommands.addTime(chat, {} as User, msg, match);

    // Assert
    assert.equal(res, "⏰ Added the new time!");
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["abc def", "one", "two"]);
  });

  it("Should throw an error when no texts are supplied", () => {

    // Arrange
    match += "   ";

    // Act
    const res = dankTimesBotCommands.addTime(chat, {} as User, msg, match);

    // Assert
    assert.equal(res, "⚠️ Not enough arguments! Format: /addtime [hour] [minute] [points] [text1],[text2], etc.");
    assert.equal(chat.dankTimes.length, 0);
  });

});
