import { assert } from "chai";
import "mocha";
import { Chat } from "../chat/chat";
import { ChatSettingsRegistry } from "../chat/settings/chat-settings-registry";
import { CoreSettingsNames } from "../chat/settings/core-settings-names";
import { DankTime } from "../dank-time/dank-time";
import { CronJobMock } from "../misc/cronjob-mock";
import { PluginHost } from "../plugin-host/plugin-host";
import { TelegramClientMock } from "../telegram-client/telegram-client-mock";
import { Util } from "../util/util";
import { DankTimeScheduler } from "./dank-time-scheduler";

const util = new Util();
const chatSettingsRegistry = new ChatSettingsRegistry();

describe("DankTimeScheduler.scheduleRandomDankTime(chat, dankTime)", () => {
  it("should schedule a random dank time", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    const dankTime = new DankTime(12, 12, ["1212"], () => 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleRandomDankTime(chat, dankTime);
    assert.equal(scheduler.randomDankTimeNotifications.length, 1);
    const item = scheduler.randomDankTimeNotifications[0];
    assert.deepEqual(item.chatId, chat.id);
    assert.deepEqual(item.hour, dankTime.hour);
    assert.deepEqual(item.minute, dankTime.minute);
  });
});

describe("DankTimeScheduler.scheduleDankTime(chat, dankTime)", () => {
  it("should schedule a normal dank time", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    const dankTime = new DankTime(12, 12, ["1212"], () => 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleDankTime(chat, dankTime);
    assert.equal(scheduler.dankTimeNotifications.length, 1);
    const item = scheduler.dankTimeNotifications[0];
    assert.deepEqual(item.chatId, chat.id);
    assert.deepEqual(item.hour, dankTime.hour);
    assert.deepEqual(item.minute, dankTime.minute);
  });
});

describe("DankTimeScheduler.unscheduleRandomDankTime(chat, dankTime)", () => {
  it("should unschedule a random dank time", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    const dankTime = new DankTime(12, 12, ["1212"], () => 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleRandomDankTime(chat, dankTime);
    scheduler.unscheduleRandomDankTime(chat, dankTime);
    assert.equal(scheduler.randomDankTimeNotifications.length, 0);
  });
});

describe("DankTimeScheduler.unscheduleDankTime(chat, dankTime)", () => {
  it("should unschedule a normal dank time", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    const dankTime = new DankTime(12, 12, ["1212"], () => 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleDankTime(chat, dankTime);
    scheduler.unscheduleDankTime(chat, dankTime);
    assert.equal(scheduler.dankTimeNotifications.length, 0);
  });
});

describe("DankTimeScheduler.reset()", () => {
  it("should reset all scheduled notifications", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    const dankTime = new DankTime(12, 12, ["1212"], () => 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleDankTime(chat, dankTime);
    scheduler.scheduleRandomDankTime(chat, dankTime);
    scheduler.reset();
    assert.equal(scheduler.dankTimeNotifications.length, 0);
    assert.equal(scheduler.randomDankTimeNotifications.length, 0);
  });
});

describe("DankTimeScheduler.unscheduleRandomDankTimesOfChat(chat)", () => {
  it("should unschedule all random dank times of a chat", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleRandomDankTimesOfChat(chat);
    scheduler.unscheduleRandomDankTimesOfChat(chat);
    assert.equal(scheduler.randomDankTimeNotifications.length, 0);
  });
});

describe("DankTimeScheduler.unscheduleDankTimesOfChat(chat)", () => {
  it("should unschedule all normal dank times of a chat", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    chat.addDankTime(new DankTime(12, 12, ["1212"], () => 5));
    chat.addDankTime(new DankTime(21, 21, ["2121"], () => 5));

    // Act and assert.
    scheduler.scheduleDankTimesOfChat(chat);
    scheduler.unscheduleDankTimesOfChat(chat);
    assert.equal(scheduler.dankTimeNotifications.length, 0);
  });
});

describe("DankTimeScheduler.unscheduleAllOfChat(chat)", () => {
  it("should unschedule all notifications of a chat", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    chat.addDankTime(new DankTime(12, 12, ["1212"], () => 5));
    chat.addDankTime(new DankTime(21, 21, ["2121"], () => 5));
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleDankTimesOfChat(chat);
    scheduler.scheduleRandomDankTimesOfChat(chat);
    scheduler.unscheduleAllOfChat(chat);
    assert.equal(scheduler.dankTimeNotifications.length, 0);
    assert.equal(scheduler.randomDankTimeNotifications.length, 0);
  });
});

describe("DankTimeScheduler.scheduleRandomDankTimesOfChat(chat)", () => {
  it("should schedule all random dank times of a chat", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    chat.setSetting(CoreSettingsNames.randomtimesFrequency, "5");
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleRandomDankTimesOfChat(chat);
    assert.equal(scheduler.randomDankTimeNotifications.length, 5);
  });
});

describe("DankTimeScheduler.scheduleDankTimesOfChat(chat)", () => {
  it("should schedule all normal dank times of a chat", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    const settings = chatSettingsRegistry.getChatSettings();
    const chat = new Chat(util, 1234, new PluginHost([]), settings);
    chat.addDankTime(new DankTime(12, 12, ["1212"], () => 5));
    chat.addDankTime(new DankTime(21, 21, ["2121"], () => 5));

    // Act and assert.
    scheduler.scheduleDankTimesOfChat(chat);
    assert.equal(scheduler.dankTimeNotifications.length, 2);
  });
});

describe("DankTimeScheduler.scheduleAllOfChat(chat)", () => {

  const settings = chatSettingsRegistry.getChatSettings();
  const chat = new Chat(util, 1234, new PluginHost([]), settings);
  chat.addDankTime(new DankTime(12, 12, ["1212"], () => 5));
  chat.addDankTime(new DankTime(21, 21, ["2121"], () => 5));
  chat.setSetting(CoreSettingsNames.randomtimesFrequency, "5");
  chat.generateRandomDankTimes();

  it("should not schedule anything if the chat is not running", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    chat.running = false;
    chat.setSetting(CoreSettingsNames.normaltimesNotifications, "true");

    if (!chat.autoleaderboards) {
      chat.setSetting(CoreSettingsNames.autoleaderboards, "true");
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler.dankTimeNotifications.length, 0);
    assert.equal(scheduler.randomDankTimeNotifications.length, 0);
  });

  it("should schedule everything", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    chat.running = true;
    chat.setSetting(CoreSettingsNames.normaltimesNotifications, "true");

    if (chat.autoleaderboards) {
      chat.setSetting(CoreSettingsNames.autoleaderboards, "false");
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler.dankTimeNotifications.length, 2);
    assert.equal(scheduler.randomDankTimeNotifications.length, 5);
  });

  it("should schedule everything if everything is enabled", () => {

    // Prepare.
    const scheduler = new DankTimeScheduler(new TelegramClientMock(), CronJobMock);
    chat.running = true;
    chat.setSetting(CoreSettingsNames.normaltimesNotifications, "true");

    if (!chat.autoleaderboards) {
      chat.setSetting(CoreSettingsNames.autoleaderboards, "true");
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler.dankTimeNotifications.length, 2);
    assert.equal(scheduler.randomDankTimeNotifications.length, 5);
  });
});
