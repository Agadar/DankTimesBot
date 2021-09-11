import { assert } from "chai";
import * as moment from "moment-timezone";
import {instance, mock, when} from "ts-mockito";
import { ChatRegistryMock } from "../chat-registry/chat-registry-mock";
import { Chat } from "../chat/chat";
import { DankTimeSchedulerMock } from "../dank-time-scheduler/dank-time-scheduler-mock";
import { PluginHost } from "../plugin-host/plugin-host";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import { TelegramClientMock } from "../telegram-client/telegram-client-mock";
import { DankTimesBotController } from "./danktimesbot-controller";

let dankController: DankTimesBotController;
let chatRegistry: ChatRegistryMock;
let dankTimeScheduler: DankTimeSchedulerMock;
let telegramClient: TelegramClientMock;
let pluginHost: PluginHost;

function initTestVariables() {
  chatRegistry = new ChatRegistryMock();
  dankTimeScheduler = new DankTimeSchedulerMock();
  telegramClient = new TelegramClientMock();
  pluginHost = mock(PluginHost);
  when(pluginHost.plugins).thenReturn(new Array<AbstractPlugin>());
  dankController = new DankTimesBotController(chatRegistry, dankTimeScheduler, telegramClient, instance(pluginHost));
}

class ChatMock {
  public running = true;
  public generateRandomDankTimesCalled = false;
  public hardcoreModeCheckCalled = false;

  public generateRandomDankTimes() {
    this.generateRandomDankTimesCalled = true;
  }

  public hardcoreModeCheck(now: number) {
    this.hardcoreModeCheckCalled = true;
  }
}

describe("DankTimesBotController.onErrorFromApi", () => {

  beforeEach("setup test variables", () => initTestVariables());

  it("Removes the chat from the registry and unschedules its times if the error code is 403", () => {

    // Arrange
    const chat = {} as Chat;
    chatRegistry.chats.set(1, chat);

    // Act
    dankController.onErrorFromApi(1, { response: { statusCode: 403 } });

    // Assert
    assert.equal(chatRegistry.removeChatCalledWithId, 1);
    assert.equal(dankTimeScheduler.unscheduleAllOfChatCalledWith, chat);
  });

  it("Does not remove the chat from the registry if the error code is not 403", () => {

    // Arrange
    const chat = {} as Chat;
    chatRegistry.chats.set(1, chat);

    // Act
    dankController.onErrorFromApi(1, { response: { statusCode: 400 } });

    // Assert
    assert.equal(chatRegistry.removeChatCalledWithId, null);
    assert.equal(dankTimeScheduler.unscheduleAllOfChatCalledWith, null);
  });

});

describe("DankTimesBotController.onChatCreated", () => {

  beforeEach("setup test variables", () => initTestVariables());

  it("Schedules all the dank times of the chat", () => {

    // Arrange
    const chat = {} as Chat;

    // Act
    dankController.onChatCreated(chat);

    // Assert
    assert.equal(dankTimeScheduler.scheduleAllOfChatCalledWith, chat);
  });

});

describe("DankTimesBotController.doNightlyUpdate", () => {

  beforeEach("setup test variables", () => initTestVariables());

  it("Does all the actions a nightly update should do", () => {

    // Arrange
    const chat = new ChatMock();
    const chatCast = chat as any as Chat;
    chatRegistry.chats.set(1, chatCast);

    // Act
    dankController.doNightlyUpdate();

    // Assert
    assert.equal(dankTimeScheduler.resetCalled, true);
    assert.equal(chat.generateRandomDankTimesCalled, true);
    assert.equal(dankTimeScheduler.scheduleAllOfChatCalledWith, chatCast);
    assert.equal(chat.hardcoreModeCheckCalled, true);
  });

});
