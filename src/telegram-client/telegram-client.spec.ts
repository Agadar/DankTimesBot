import * as chai from "chai";
const assert = chai.assert;
import "mocha";
import moment from "moment";
import TelegramBot from "node-telegram-bot-api";
import { anyNumber, anyString, anything, instance, mock, when } from "ts-mockito";

import { DankTimesBotControllerMock } from "../danktimesbot-controller/danktimesbot-controller-mock";
import { TelegramClient } from "./telegram-client";

describe("TelegramClient #sendMessage", () => {

  let telegramClient: TelegramClient;
  let dankController: DankTimesBotControllerMock;
  let telegramBotMock: TelegramBot;
  let telegramBotMockInstance: TelegramBot;

  const testUser: TelegramBot.User = {
    first_name: "botusername",
    id: 0,
    is_bot: false,
    username: "botusername",
  };

  beforeEach("Set up test variables", () => {
    telegramBotMock = mock(TelegramBot);

    when(telegramBotMock.getMe).thenReturn(() => Promise.resolve(testUser));
    when(telegramBotMock.getChatAdministrators).thenReturn(() => Promise.resolve([{
      can_send_polls: true,
      status: "administrator",
      user: testUser,
    }]));

    telegramBotMockInstance = instance(telegramBotMock);

    dankController = new DankTimesBotControllerMock();
    telegramClient = new TelegramClient(telegramBotMockInstance);
    telegramClient.subscribe(dankController);
  });

  it("Should NOT inform listeners if the Telegram API returned OK", async () => {
    const message: TelegramBot.Message = {
      chat: {
        id: 0,
        type: "private",
      },
      date: moment.now() / 1000,
      message_id: 0,
    };
    when(telegramBotMock.sendMessage).thenReturn(() => Promise.resolve(message));

    await telegramClient.sendMessage(1, "some html");
    assert.isNull(dankController.onErrorFromApiCalledWith);
  });

  it("Should inform listeners if the Telegram API returned an error", async () => {
    when(telegramBotMock.sendMessage(anyNumber(), anyString(), anything())).thenReject(new Error());

    await telegramClient.sendMessage(-1, "some html");
    assert.isDefined(dankController.onErrorFromApiCalledWith);
    assert.isNotNull(dankController.onErrorFromApiCalledWith);
  });

});
