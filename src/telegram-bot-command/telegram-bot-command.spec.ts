import 'mocha';
import assert = require('assert');
import { TelegramBotCommand } from './telegram-bot-command';

describe('TelegramBotCommand.getRegex()', () => {

  const regex = new TelegramBotCommand('command', 'command description', {},
    (msg, match) => { return '' }, false, false).getRegex('DankTimesBot');

  const tests = [
    { arg: '/command', expected: true },

    { arg: ' /command', expected: false },
    { arg: '/command ', expected: false },
    { arg: ' /command ', expected: false },

    { arg: 'a/command', expected: false },
    { arg: '/commanda', expected: false },
    { arg: 'a/commanda', expected: false },

    { arg: 'a /command', expected: false },
    { arg: '/command a', expected: true },
    { arg: 'a /command a', expected: false },

    { arg: '/command a/a', expected: true },
    { arg: 'a/a /command', expected: false },
    { arg: 'a/a /command a/a', expected: false },

    { arg: '/command@DankTimesBot', expected: true },

    { arg: ' /command@DankTimesBot', expected: false },
    { arg: '/command@DankTimesBot ', expected: false },
    { arg: ' /command@DankTimesBot ', expected: false },

    { arg: 'a/command@DankTimesBot', expected: false },
    { arg: '/command@DankTimesBota', expected: false },
    { arg: 'a/command@DankTimesBota', expected: false },

    { arg: 'a /command@DankTimesBot', expected: false },
    { arg: '/command@DankTimesBot a', expected: true },
    { arg: 'a /command@DankTimesBot a', expected: false },

    { arg: '/command@DankTimesBot a/a', expected: true },
    { arg: 'a/a /command@DankTimesBot', expected: false },
    { arg: 'a/a /command@DankTimesBot a/a', expected: false },
  ];

  tests.forEach(test => {
    it('Should produce a valid regex (' + test.arg + ')', function () {
      assert.equal(regex.test(test.arg), test.expected);
    });
  });
});