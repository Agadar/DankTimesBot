'use strict';

// Imports.
const Chat = require('../src/chat.js');
const DankTime = require('../src/dank-time.js');
const assert = require('assert');
const DankTimeScheduler = require('../src/dank-time-scheduler.js');

// Mock TelegramClient.
let mock_tgClient = {
  sendMessage(chatId, message) { }
};

describe('DankTimeScheduler.scheduleAutoLeaderboard(chat, dankTime)', function () {
  it('should schedule an auto-leaderboard post', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleAutoLeaderboard(chat, dankTime);
    assert.equal(scheduler._autoLeaderBoards.length, 1);
    const item = scheduler._autoLeaderBoards[0];
    assert.deepEqual(item.chatId, chat.getId());
    assert.deepEqual(item.hour, dankTime.getHour());
    assert.deepEqual(item.minute, dankTime.getMinute());
  });
});

describe('DankTimeScheduler.scheduleRandomDankTime(chat, dankTime)', function () {
  it('should schedule a random dank time', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleRandomDankTime(chat, dankTime);
    assert.equal(scheduler._randomDankTimeNotifications.length, 1);
    const item = scheduler._randomDankTimeNotifications[0];
    assert.deepEqual(item.chatId, chat.getId());
    assert.deepEqual(item.hour, dankTime.getHour());
    assert.deepEqual(item.minute, dankTime.getMinute());
  });
});

describe('DankTimeScheduler.scheduleDankTime(chat, dankTime)', function () {
  it('should schedule a normal dank time', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleDankTime(chat, dankTime);
    assert.equal(scheduler._dankTimeNotifications.length, 1);
    const item = scheduler._dankTimeNotifications[0];
    assert.deepEqual(item.chatId, chat.getId());
    assert.deepEqual(item.hour, dankTime.getHour());
    assert.deepEqual(item.minute, dankTime.getMinute());
  });
});

describe('DankTimeScheduler.unscheduleAutoLeaderboard(chat, dankTime)', function () {
  it('should unschedule an auto-leaderboard post', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleAutoLeaderboard(chat, dankTime);
    scheduler.unscheduleAutoLeaderboard(chat, dankTime);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
  });
});

describe('DankTimeScheduler.unscheduleRandomDankTime(chat, dankTime)', function () {
  it('should unschedule a random dank time', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleRandomDankTime(chat, dankTime);
    scheduler.unscheduleRandomDankTime(chat, dankTime);
    assert.equal(scheduler._randomDankTimeNotifications.length, 0);
  });
});

describe('DankTimeScheduler.unscheduleDankTime(chat, dankTime)', function () {
  it('should unschedule a normal dank time', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleDankTime(chat, dankTime);
    scheduler.unscheduleDankTime(chat, dankTime);
    assert.equal(scheduler._dankTimeNotifications.length, 0);
  });
});

describe('DankTimeScheduler.reset()', function () {
  it('should reset all scheduled notifications', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    const dankTime = new DankTime(12, 12, ['1212'], 5);
    chat.addDankTime(dankTime);

    // Act and assert.
    scheduler.scheduleDankTime(chat, dankTime);
    scheduler.scheduleRandomDankTime(chat, dankTime);
    scheduler.scheduleAutoLeaderboard(chat, dankTime);
    scheduler.reset();
    assert.equal(scheduler._dankTimeNotifications.length, 0);
    assert.equal(scheduler._randomDankTimeNotifications.length, 0);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
  });
});

describe('DankTimeScheduler.unscheduleAutoLeaderboardsOfChat(chat)', function () {
  it('should unschedule all auto-leaderboards of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
    chat.addDankTime(new DankTime(21, 21, ['2121'], 5));
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleAutoLeaderboardsOfChat(chat);
    scheduler.unscheduleAutoLeaderboardsOfChat(chat);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
  });
});

describe('DankTimeScheduler.unscheduleRandomDankTimesOfChat(chat)', function () {
  it('should unschedule all random dank times of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleRandomDankTimesOfChat(chat);
    scheduler.unscheduleRandomDankTimesOfChat(chat);
    assert.equal(scheduler._randomDankTimeNotifications.length, 0);
  });
});

describe('DankTimeScheduler.unscheduleDankTimesOfChat(chat)', function () {
  it('should unschedule all normal dank times of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
    chat.addDankTime(new DankTime(21, 21, ['2121'], 5));

    // Act and assert.
    scheduler.scheduleDankTimesOfChat(chat);
    scheduler.unscheduleDankTimesOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 0);
  });
});

describe('DankTimeScheduler.unscheduleAllOfChat(chat)', function () {
  it('should unschedule all notifications of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
    chat.addDankTime(new DankTime(21, 21, ['2121'], 5));
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleDankTimesOfChat(chat);
    scheduler.scheduleRandomDankTimesOfChat(chat);
    scheduler.scheduleAutoLeaderboardsOfChat(chat);
    scheduler.unscheduleAllOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 0);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
    assert.equal(scheduler._randomDankTimeNotifications.length, 0);
  });
});

describe('DankTimeScheduler.scheduleAutoLeaderboardsOfChat(chat)', function () {
  it('should schedule all auto-leaderboards of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
    chat.addDankTime(new DankTime(21, 21, ['2121'], 5));
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleAutoLeaderboardsOfChat(chat);
    assert.equal(scheduler._autoLeaderBoards.length, 3);
  });
});

describe('DankTimeScheduler.scheduleRandomDankTimesOfChat(chat)', function () {
  it('should schedule all random dank times of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.setNumberOfRandomTimes(5);
    chat.generateRandomDankTimes();

    // Act and assert.
    scheduler.scheduleRandomDankTimesOfChat(chat);
    assert.equal(scheduler._randomDankTimeNotifications.length, 5);
  });
});

describe('DankTimeScheduler.scheduleDankTimesOfChat(chat)', function () {
  it('should schedule all normal dank times of a chat', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
    chat.addDankTime(new DankTime(21, 21, ['2121'], 5));

    // Act and assert.
    scheduler.scheduleDankTimesOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 2);
  });
});

describe('DankTimeScheduler.scheduleAllOfChat(chat)', function () {

  const chat = new Chat(1234);
  chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
  chat.addDankTime(new DankTime(21, 21, ['2121'], 5));
  chat.setNumberOfRandomTimes(5);
  chat.generateRandomDankTimes();

  it('should not schedule anything if the chat is not running', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    chat.setRunning(false);
    chat.setNotifications(true);
    if (!chat.getAutoLeaderboards()) {
      chat.toggleAutoLeaderboards();
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 0);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
    assert.equal(scheduler._randomDankTimeNotifications.length, 0);
  });

  it('should schedule only random dank times if others are disabled', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    chat.setRunning(true);
    chat.setNotifications(false);
    if (chat.getAutoLeaderboards()) {
      chat.toggleAutoLeaderboards();
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 0);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
    assert.equal(scheduler._randomDankTimeNotifications.length, 5);
  });

  it('should schedule everything save for auto-leaderboards if its disabled', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    chat.setRunning(true);
    chat.setNotifications(true);
    if (chat.getAutoLeaderboards()) {
      chat.toggleAutoLeaderboards();
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 2);
    assert.equal(scheduler._autoLeaderBoards.length, 0);
    assert.equal(scheduler._randomDankTimeNotifications.length, 5);
  });

  it('should schedule everything save for normal dank times if its disabled', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    chat.setRunning(true);
    chat.setNotifications(false);
    if (!chat.getAutoLeaderboards()) {
      chat.toggleAutoLeaderboards();
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 0);
    assert.equal(scheduler._autoLeaderBoards.length, 7);
    assert.equal(scheduler._randomDankTimeNotifications.length, 5);
  });

  it('should schedule everything if everything is enabled', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(mock_tgClient);
    chat.setRunning(true);
    chat.setNotifications(true);
    if (!chat.getAutoLeaderboards()) {
      chat.toggleAutoLeaderboards();
    }

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._dankTimeNotifications.length, 2);
    assert.equal(scheduler._autoLeaderBoards.length, 7);
    assert.equal(scheduler._randomDankTimeNotifications.length, 5);
  });
});
