import { assert } from "chai";
import "mocha";
import * as moment from "moment-timezone";

import { ChatRegistryMock } from "../../chat-registry/chat-registry-mock";
import { Chat } from "../../chat/chat";
import { DankTimeSchedulerMock } from "../../dank-time-scheduler/dank-time-scheduler-mock";
import { PluginHost } from "../../plugin-host/plugin-host";
import { TelegramClientMock } from "../../telegram-client/telegram-client-mock";
import { Util } from "../../util/util";
import { BotCommand } from "../bot-command";
import { DankTimesBotCommands } from "./danktimesbot-commands";

describe("DankTimesBotCommands.addTime", () => {

  let dankTimesBotCommands: DankTimesBotCommands;
  let chatRegistry: ChatRegistryMock;
  const scheduler = new DankTimeSchedulerMock();
  const util = new Util();
  const clientMock = new TelegramClientMock();
  let chat: Chat;
  const msg = {
    chat: {
      id: 0,
    },
  };
  const match = {
    input: "",
  };

  beforeEach("Instantiate test variables", () => {
    chatRegistry = new ChatRegistryMock();
    dankTimesBotCommands = new DankTimesBotCommands(clientMock, chatRegistry, scheduler, util, [], "x.y.z");
    chat = new Chat(moment, util, 0, new PluginHost([]));
    match.input = "/addtime 22 33 5";

    chat.dankTimes.splice(0);
    chatRegistry.chats.set(chat.id, chat);
  });

  it("Should create a dank time with as text a single word", () => {

    // Arrange
    match.input += " one";

    // Act
    const res = dankTimesBotCommands.addTime(msg, match);

    // Assert
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["one"]);
    assert.equal(res, "⏰ Added the new time!");
  });

  it("Should create a dank time with as text a single sentence", () => {

    // Arrange
    match.input += " abc def ghi";

    // Act
    const res = dankTimesBotCommands.addTime(msg, match);

    // Assert
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["abc def ghi"]);
    assert.equal(res, "⏰ Added the new time!");
  });

  it("Should create a dank time with as texts multiple single words", () => {

    // Arrange
    match.input += " one, two , three";

    // Act
    const res = dankTimesBotCommands.addTime(msg, match);

    // Assert
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["one", "two", "three"]);
    assert.equal(res, "⏰ Added the new time!");
  });

  it("Should create a dank time with as texts multiple sentences", () => {

    // Arrange
    match.input += " abc def, ghi jkl , mno pqr";

    // Act
    const res = dankTimesBotCommands.addTime(msg, match);

    // Assert
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["abc def", "ghi jkl", "mno pqr"]);
    assert.equal(res, "⏰ Added the new time!");
  });

  it("Should create a dank time with as texts a mixture of single words and sentences", () => {

    // Arrange
    match.input += " abc def, one , two";

    // Act
    const res = dankTimesBotCommands.addTime(msg, match);

    // Assert
    assert.equal(chat.dankTimes.length, 1);
    const dankTime = chat.dankTimes[0];
    assert.equal(dankTime.hour, 22);
    assert.equal(dankTime.minute, 33);
    assert.deepEqual(dankTime.texts, ["abc def", "one", "two"]);
    assert.equal(res, "⏰ Added the new time!");
  });

  it("Should throw an error when no texts are supplied", () => {

    // Arrange
    match.input += "   ";

    // Act
    const res = dankTimesBotCommands.addTime(msg, match);

    // Assert
    assert.equal(chat.dankTimes.length, 0);
    assert.equal(res, "⚠️ Not enough arguments! Format: /addtime [hour] [minute] [points] [text1],[text2], etc.");
  });

});
