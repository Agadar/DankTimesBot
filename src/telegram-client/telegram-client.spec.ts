import * as chai from "chai";
const assert = chai.assert;
import "mocha";

import {
  DankTimesBotControllerMock,
} from "../danktimesbot-controller/danktimesbot-controller-mock";
import * as nodeTelegramBotApiMock from "../misc/node-telegram-bot-api-mock";
import { TelegramClient } from "./telegram-client";

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
