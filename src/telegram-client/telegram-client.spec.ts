import * as chai from "chai";
const assert = chai.assert;
import "mocha";

import { BotCommand } from "../bot-commands/bot-command";
import {
  DankTimesBotControllerMock,
} from "../danktimesbot-controller/danktimesbot-controller-mock";
import * as nodeTelegramBotApiMock from "../misc/node-telegram-bot-api-mock";
import { TelegramClient } from "./telegram-client";

describe("TelegramClient #executeCommand", () => {

  const expectedCommandCalledText = "Called!";
  const nonAdmincommandObject = {
    commandFunction: (msg0: any, match: string[]) => {
      nonAdminCommandCalled = true;
      return expectedCommandCalledText;
    },
  };
  const admincommandObject = {
    commandFunction: (msg0: any, match: string[]) => {
      adminCommandCalled = true;
      return expectedCommandCalledText;
    },
  };
  const nonAdminCommand = new BotCommand("testcommand", "description", nonAdmincommandObject,
    nonAdmincommandObject.commandFunction, false, false);
  const adminCommand = new BotCommand("testcommand", "description", admincommandObject,
    admincommandObject.commandFunction, true, false);
  const expectedAdminOnlyWarning = "🚫 This option is only available to admins!";

  let telegramClient: TelegramClient;
  let nonAdminCommandCalled: boolean;
  let adminCommandCalled: boolean;
  let msg = {
    chat: {
      id: 0,
      type: "private",
    },
    from: {
      id: 0,
    },
  };

  beforeEach("Set up test variables", () => {
    telegramClient = new TelegramClient(nodeTelegramBotApiMock);
    nonAdminCommandCalled = false;
    adminCommandCalled = false;
    msg = {
      chat: {
        id: 0,
        type: "public",
      },
      from: {
        id: 0,
      },
    };
  });

  it("should execute a non-admin-only command as a non-admin", async () => {
    // Arrange
    msg.from.id = 1;

    // Act
    const reply = await telegramClient.executeCommand(msg, [], nonAdminCommand);

    // Assert
    assert.equal(reply, expectedCommandCalledText);
    assert.isTrue(nonAdminCommandCalled);
  });

  it("should execute a non-admin-only command as an admin", async () => {
    // Arrange
    msg.from.id = 0;

    // Act
    const reply = await telegramClient.executeCommand(msg, [], nonAdminCommand);

    // Assert
    assert.equal(reply, expectedCommandCalledText);
    assert.isTrue(nonAdminCommandCalled);
  });

  it("should NOT execute an admin-only command as a non-admin", async () => {
    // Arrange
    msg.from.id = 1;

    // Act
    const reply = await telegramClient.executeCommand(msg, [], adminCommand);

    // Assert
    assert.equal(reply, expectedAdminOnlyWarning);
    assert.isFalse(adminCommandCalled);
  });

  it("should execute an admin-only command as an admin", async () => {
    // Arrange
    msg.from.id = 0;

    // Act
    const reply = await telegramClient.executeCommand(msg, [], adminCommand);

    // Assert
    assert.equal(reply, expectedCommandCalledText);
    assert.isTrue(adminCommandCalled);
  });

  it("should execute an admin-only command as a non-admin in a private chat", async () => {
    // Arrange
    msg.from.id = 1;
    msg.chat.type = "private";

    // Act
    const reply = await telegramClient.executeCommand(msg, [], adminCommand);

    // Assert
    assert.equal(reply, expectedCommandCalledText);
    assert.isTrue(adminCommandCalled);
  });

  it("should execute an admin-only command as a non-admin that is the developer", async () => {
    // Arrange
    msg.from.id = 100805902;

    // Act
    const reply = await telegramClient.executeCommand(msg, [], adminCommand);

    // Assert
    assert.equal(reply, expectedCommandCalledText);
    assert.isTrue(adminCommandCalled);
  });
});

describe("TelegramClient #sendMessage", () => {

  let telegramClient: TelegramClient;
  let dankController: DankTimesBotControllerMock;

  beforeEach("Set up test variables", () => {
    dankController = new DankTimesBotControllerMock();
    telegramClient = new TelegramClient(nodeTelegramBotApiMock);
    telegramClient.subscribe(dankController);
  });

  it("Should NOT inform listeners if the Telegram API returned OK", async () => {
    await telegramClient.sendMessage(1, "some html");
    assert.isNull(dankController.onErrorFromApiCalledWith);
  });

  it("Should inform listeners if the Telegram API returned an error", async () => {
    await telegramClient.sendMessage(-1, "some html");
    assert.isDefined(dankController.onErrorFromApiCalledWith);
    assert.isNotNull(dankController.onErrorFromApiCalledWith);
    const calledWith = dankController.onErrorFromApiCalledWith as any;
    assert.equal(calledWith.chatId, -1);
    assert.equal(calledWith.error.response.statusCode, 403);
  });

});
