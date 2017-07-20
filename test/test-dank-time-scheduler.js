'use strict';

// Imports.
const assert = require('assert');
const Chat = require('../src/chat.js');
const DankTime = require('../src/dank-time.js');
const DankTimeScheduler = require('../src/dank-time-scheduler.js');

/*describe('DankTimeScheduler.scheduleAllOfChat(chat)', function () {

  it('should schedule a dank time if it is present', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(undefined);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._jobs.length, 2);
  });

  it('should schedule dank times if they are present', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(undefined);
    const chat = new Chat(1234);
    chat.addDankTime(new DankTime(12, 12, ['1212'], 5));
    chat.addDankTime(new DankTime(21, 21, ['2121'], 5));

    // Act and assert.
    scheduler.scheduleAllOfChat(chat);
    assert.equal(scheduler._jobs.length, 4);
  });

});

describe('DankTimeScheduler.unscheduleAllOfChat(chat)', function () {

  it('should unschedule a dank time if it is present', function () {

    // Prepare.
    const chat = new Chat(1234);
    const scheduler = new DankTimeScheduler(undefined);
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 4321, hour: 12, minute: 12, cronJob: { stop() { } } });

    // Act and assert.
    scheduler.unscheduleAllOfChat(chat);
    assert.equal(scheduler._jobs.length, 1);
  });

  it('should unschedule dank times if they are present', function () {

    // Prepare.
    const chat = new Chat(1234);
    const scheduler = new DankTimeScheduler(undefined);
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 4321, hour: 12, minute: 12, cronJob: { stop() { } } });

    // Act and assert.
    scheduler.unscheduleAllOfChat(chat);
    assert.equal(scheduler._jobs.length, 1);
  });

});

describe('DankTimeScheduler.reset()', function () {

  it('should unschedule all dank times', function () {

    // Prepare.
    const scheduler = new DankTimeScheduler(undefined);
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 4321, hour: 12, minute: 12, cronJob: { stop() { } } });

    // Act and assert.
    scheduler.reset();
    assert.equal(scheduler._jobs.length, 0);
  });

});

describe('DankTimeScheduler.unschedule(chat, dankTime)', function () {

  it('should unschedule a dank time if it is present', function () {

    // Prepare.
    const chat = new Chat(4321);
    const scheduler = new DankTimeScheduler(undefined);
    const dankTime = new DankTime(12, 12, ['irrelevant']);
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 4321, hour: 12, minute: 12, cronJob: { stop() { } } });

    // Act and assert.
    scheduler.unschedule(chat, dankTime);
    assert.equal(scheduler._jobs.length, 2);
  });

  it('should unschedule dank times if they are present', function () {

    // Prepare.
    const chat = new Chat(1234);
    const scheduler = new DankTimeScheduler(undefined);
    const dankTime = new DankTime(12, 12, ['irrelevant']);
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 1234, hour: 12, minute: 12, cronJob: { stop() { } } });
    scheduler._jobs.push({ chatId: 4321, hour: 12, minute: 12, cronJob: { stop() { } } });

    // Act and assert.
    scheduler.unschedule(chat, dankTime);
    assert.equal(scheduler._jobs.length, 1);
  });

});

describe('DankTimeScheduler.schedule(chat, dankTime, text)', function () {

  it('should schedule a dank time', function () {

    // Prepare.
    const chat = new Chat(1234);
    const scheduler = new DankTimeScheduler(undefined);
    const dankTime = new DankTime(12, 12, ['irrelevant']);

    // Act and assert.
    scheduler.schedule(chat, dankTime, 'irrelevant');
    assert.equal(scheduler._jobs.length, 2);
  });

});*/