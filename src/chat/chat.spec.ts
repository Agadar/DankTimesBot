import { assert } from "chai";
import "mocha";
import moment from "moment-timezone";
import TelegramBot from "node-telegram-bot-api";
import { DankTime } from "../dank-time/dank-time";
import { PluginHost } from "../plugin-host/plugin-host";
import { Util } from "../util/util";
import { Chat } from "./chat";
import { ChatSetting } from "./settings/chat-setting";
import { ChatSettingsRegistry } from "./settings/chat-settings-registry";
import { CoreSettingsNames } from "./settings/core-settings-names";
import { User } from "./user/user";

const util = new Util();

describe("Chat.hardcoreModeCheck", () => {
  const now = moment.now() / 1000;
  const nowMinus24Hours = now - (24 * 60 * 60);
  const nowMinusAlmost24Hours = nowMinus24Hours + 1;
  const chatSettingRegistry = new ChatSettingsRegistry();

  it("should not punish a user if hardcore mode is disabled", () => {

    // Arrange
    const startingScore = 10;
    const user = new User(0, "user0", startingScore, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = false;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, startingScore);
  });

  it("should not punish a user if hardcore mode is enabled but he scored in the last 24 hours", () => {

    // Arrange
    const startingScore = 10;
    const user = new User(0, "user0", startingScore, nowMinusAlmost24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = true;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, startingScore);
  });

  it("should punish a user if hardcore mode is enabled and he did not score in the last 24 hours", () => {

    // Arrange
    const user = new User(0, "user0", 10, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = true;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, 0);
  });

  it("punished player with score of which 10% > 10 should get 10% punishment", () => {

    // Arrange
    const user = new User(0, "user0", 250, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = true;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, 225);
  });

  it("punished player with score of which 10% <= 10 >= 10 should get 10 points punishment", () => {

    // Arrange
    const user = new User(0, "user0", 50, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = true;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, 40);
  });

  it("punished player with score < 10 should have score set to 0", () => {

    // Arrange
    const user = new User(0, "user0", 5, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = true;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, 0);
  });

  it("should NOT punish or otherwise alter a player's score if their score is 0", () => {

    // Arrange
    const user = new User(0, "user0", 0, nowMinus24Hours, false, 0);
    const users = new Map<number, User>();
    users.set(user.id, user);
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.hardcoremodeEnabled) as ChatSetting<boolean>).value = true;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, users, [], []);

    // Act
    chat.hardcoreModeCheck(now);

    // Assert
    assert.equal(user.score, 0);
  });
});

describe("Chat.generateRandomDankTimes", () => {

  const chatSettingRegistry = new ChatSettingsRegistry();

  it("should generate correct # of random dank times with correct hours, minutes, and texts", () => {

    // Arrange
    const settings = chatSettingRegistry.getChatSettings();
    (settings.get(CoreSettingsNames.randomtimesFrequency) as ChatSetting<number>).value = 10;
    (settings.get(CoreSettingsNames.randomtimesPoints) as ChatSetting<number>).value = 10;
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, undefined, [], []);

    // Act, Assert
    chat.generateRandomDankTimes().forEach((time) => {
      assert.isAtLeast(time.hour, 0);
      assert.isAtMost(time.hour, 23);
      assert.isAtLeast(time.minute, 0);
      assert.isAtMost(time.minute, 59);
      assert.equal(time.getPoints(), chat.getRandomtimesPoints());
      assert.equal(time.texts[0], util.padNumber(time.hour) + util.padNumber(time.minute));
    });
  });

  it("should not register random dank time of which the hour/minute is already registered to another NORMAL dank time",
    () => {

      // Arrange
      const originalMath = global.Math;
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0;
      global.Math = mockMath;

      const settings = chatSettingRegistry.getChatSettings();
      (settings.get(CoreSettingsNames.timezone) as ChatSetting<string>).value = "UTC";
      (settings.get(CoreSettingsNames.randomtimesFrequency) as ChatSetting<number>).value = 10;
      (settings.get(CoreSettingsNames.randomtimesPoints) as ChatSetting<number>).value = 10;
      const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, undefined, [], []);
      const now = moment.tz("UTC");
      now.minutes(0);
      chat.addDankTime(new DankTime(now.hours(), now.minutes(), ["irrelevant"], () => 10));

      // Act
      const randomDankTimes = chat.generateRandomDankTimes();

      // Assert
      assert.equal(randomDankTimes.length, 0);

      // Cleanup
      global.Math = originalMath;
    });

  it("should not register random dank time of which the hour/minute is already registered to another RANDOM dank time",
    () => {

      // Arrange
      const originalMath = global.Math;
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0;
      global.Math = mockMath;

      const settings = chatSettingRegistry.getChatSettings();
      const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, undefined, [], []);

      // Act
      const randomDankTimes = chat.generateRandomDankTimes();

      // Assert
      assert.equal(randomDankTimes.length, 1);

      // Cleanup
      global.Math = originalMath;
    });
});

describe("Chat.timezone", () => {

  const chatSettingRegistry = new ChatSettingsRegistry();

  it("should correct a valid but (for the cron library) improperly capitalized timezone", () => {

    // Arrange
    const settings = chatSettingRegistry.getChatSettings();
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, undefined, [], []);

    // Act
    chat.setSetting(CoreSettingsNames.timezone, "jaPaN");

    // Assert
    assert.equal(chat.timezone, "Japan");
  });

  it("should throw an error on an invalid timezone", () => {

    // Arrange
    const settings = chatSettingRegistry.getChatSettings();
    const chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, undefined, [], []);

    // Act, Assert
    try {
      chat.setSetting(CoreSettingsNames.timezone, "invalid/timezon");
      assert.fail(0, 1, "Expected RangeError!");
    } catch (err) {
      if (!(err instanceof RangeError)) {
        throw err;
      }
    }
  });
});

describe("Chat.processMessage", () => {

  const chatSettingRegistry = new ChatSettingsRegistry();
  let chat: Chat;
  const now = moment.tz("Europe/Amsterdam");
  const nowTimeStamp = now.unix();
  const dankTimePoints = 5;

  beforeEach("Instantiate test variables", () => {
    const settings = chatSettingRegistry.getChatSettings();
    chat = new Chat(util, 0, new PluginHost([]), settings, true, 0, 10, undefined, [], []);
    chat.dankTimes.splice(0);
    chat.addDankTime(new DankTime(now.hour(), now.minute(), ["0113"], () => dankTimePoints));
    chat.running = true;

    for (let i = 0; i < 4; i++) {
      chat.users.set(i, new User(i, `user#${i}`, i * 10));
    }
  });

  it("should award handicap value if user that scores deserves it and was first", () => {

    // Act
    const res = chat.processMessage(getTelegramMsgObject(0, "user#0", "0113", nowTimeStamp));

    // Assert
    assert.equal(res[0], "👏 user#0 was the first to score!");
    const sortedUsers = chat.sortedUsers();

    const scorer = sortedUsers[2];
    assert.equal(scorer.id, 0);
    assert.equal(scorer.score, 15);
  });

  it("should NOT award handicap value if user that scores does not deserve it and was first", () => {

    // Act
    const res = chat.processMessage(getTelegramMsgObject(3, "user#3", "0113", nowTimeStamp));

    // Assert
    assert.equal(res[0], "👏 user#3 was the first to score!");
    const sortedUsers = chat.sortedUsers();

    const scorer = sortedUsers[0];
    assert.equal(scorer.id, 3);
    assert.equal(scorer.score, 40);
  });

  it("should award handicap value if user that scores deserves it and was NOT first", () => {

    // Arrange
    chat.processMessage(getTelegramMsgObject(3, "user#3", "0113", nowTimeStamp));

    // Act
    const res = chat.processMessage(getTelegramMsgObject(0, "user#0", "0113", nowTimeStamp));

    // Assert
    assert.isEmpty(res);
    const sortedUsers = chat.sortedUsers();

    const scorer = sortedUsers[3];
    assert.equal(scorer.id, 0);
    assert.equal(scorer.score, 8);
  });

  it("should NOT award handicap value if user that scores does not deserve it and was NOT first", () => {

    // Arrange
    chat.processMessage(getTelegramMsgObject(0, "user#0", "0113", nowTimeStamp));

    // Act
    const res = chat.processMessage(getTelegramMsgObject(3, "user#3", "0113", nowTimeStamp));

    // Assert
    assert.isEmpty(res);
    const sortedUsers = chat.sortedUsers();

    const scorer = sortedUsers[0];
    assert.equal(scorer.id, 3);
    assert.equal(scorer.score, 35);
  });

  it("should NOT award handicap value if user that scores deserves it and was first but handicap is disabled", () => {

    // Arrange
    chat.setSetting(CoreSettingsNames.handicapsEnabled, "false");

    // Act
    const res = chat.processMessage(getTelegramMsgObject(0, "user#0", "0113", nowTimeStamp));

    // Assert
    assert.equal(res[0], "👏 user#0 was the first to score!");
    const sortedUsers = chat.sortedUsers();

    const scorer = sortedUsers[2];
    assert.equal(scorer.id, 0);
    assert.equal(scorer.score, 10);
  });

  it("should NOT award handicap value if user that scores deserves it and was first but is only one in chat", () => {

    // Arrange
    chat.removeUser(1);
    chat.removeUser(2);
    chat.removeUser(3);

    // Act
    const res = chat.processMessage(getTelegramMsgObject(0, "user#0", "0113", nowTimeStamp));

    // Assert
    assert.equal(res[0], "👏 user#0 was the first to score!");
    const sortedUsers = chat.sortedUsers();

    const scorer = sortedUsers[0];
    assert.equal(scorer.id, 0);
    assert.equal(scorer.score, 10);
  });

  it("should punish a player for calling out a dank time at the wrong time", () => {

    // Arrange
    chat.setSetting(CoreSettingsNames.punishUntimelyDankTime, "true");
    chat.addDankTime(new DankTime(1, 14, ["0114"], () => dankTimePoints));

    // Act
    const res = chat.processMessage(getTelegramMsgObject(1, "user#1", "0114", nowTimeStamp));

    // Assert
    const user = chat.getOrCreateUser(1);
    assert.equal(user.score, 5);
  });

  it("should NOT punish a player for calling out a dank time at the wrong time if configured not to", () => {

    // Arrange
    chat.setSetting(CoreSettingsNames.punishUntimelyDankTime, "false");
    chat.addDankTime(new DankTime(1, 14, ["0114"], () => dankTimePoints));

    // Act
    const res = chat.processMessage(getTelegramMsgObject(1, "user#1", "0114", nowTimeStamp));

    // Assert
    const user = chat.getOrCreateUser(1);
    assert.equal(user.score, 10);
  });

});

function getTelegramMsgObject(fromId: number, fromName: string, usertext: string, timestamp: number): TelegramBot.Message {
  return {
    chat: {
      id: 0,
      type: "private",
    },
    date: timestamp,
    from: {
      first_name: fromName,
      id: fromId,
      is_bot: false,
      username: fromName,
    },
    message_id: 0,
    text: usertext,
  };
}
