'use strict';

// External imports.
const time = require('time')(Date);            // NodeJS library for working with timezones.
const cron = require('cron');                  // NodeJS library for scheduling cron jobs.
const nodeCleanup = require('node-cleanup');   // NodeJS library for running code on program exit.

// Internal imports.
const fileIO = require('./file-io.js');          // Custom script for file I/O related stuff.
const Command = require('./command.js');
const TG_CLIENT = require('./telegram-client.js');
const commands = require('./command-functions.js');
const CHAT_REGISTRY = require('./chat-registry.js');

// Global variables.
const SETTINGS = fileIO.loadSettingsFromFile();

// Initialize TG_CLIENT and CHAT_REGISTRY.
CHAT_REGISTRY.setChats(fileIO.loadChatsFromFile());
TG_CLIENT.init(SETTINGS.apiKey);

// Register available Telegram bot commands.
TG_CLIENT.registerCommand(new Command('add_time', 'Adds a dank time. Format: [hour] [minute] [points] [text1] [text2] etc.', commands.addTime, true));
TG_CLIENT.registerCommand(new Command('help', 'Shows the available commands.', commands.help));
TG_CLIENT.registerCommand(new Command('leaderboard', 'Shows the leaderboard.', commands.leaderBoard));
TG_CLIENT.registerCommand(new Command('remove_time', 'Removes a dank time. Format: [hour] [minute]', commands.removeTime, true));
TG_CLIENT.registerCommand(new Command('reset', 'Resets the scores.', commands.resetChat, true, true));
TG_CLIENT.registerCommand(new Command('settings', 'Shows the current settings.', commands.chatSettings));
TG_CLIENT.registerCommand(new Command('set_daily_random_frequency', 'Sets the number of random dank times per day. Format: [number]', commands.setDailyRandomTimes, true));
TG_CLIENT.registerCommand(new Command('set_daily_random_points', 'Sets the points for random daily dank times. Format: [number]', commands.setDailyRandomTimesPoints, true));
TG_CLIENT.registerCommand(new Command('set_timezone', 'Sets the time zone. Format: [timezone]', commands.setTimezone, true));
TG_CLIENT.registerCommand(new Command('start', 'Starts keeping track of scores.', commands.startChat, true));
TG_CLIENT.setOnAnyText((msg) => {
  if (msg.text) {
    CHAT_REGISTRY.getOrCreateChat(msg.chat.id).processMessage(msg.from.id, msg.from.username || 'anonymous', msg.text, msg.date);
  }
});

// Schedule to persist chats map to file every X minutes.
setInterval(function () {
  fileIO.saveChatsToFile(CHAT_REGISTRY.getChats());
  console.info('Persisted data to file.');
}, SETTINGS.persistenceRate * 60 * 1000);

// Schedule to persist chats map to file on program exit.
nodeCleanup(function (exitCode, signal) {
  console.info('Persisting data to file before exiting...');
  fileIO.saveChatsToFile(CHAT_REGISTRY.getChats());
});

/** Generates random dank times daily for all chats at 00:00:00. */
new cron.CronJob('0 0 0 * * *', function () {
  console.info('Generating random dank times for all chats!');

  CHAT_REGISTRY.getChats().forEach(chat => {
    if (chat.isRunning()) {
      chat.generateRandomDankTimes().forEach(randomTime => {
        new cron.CronJob('0 ' + chat.getMinutes() + ' ' + chat.getHours() + ' * * *', function () {
          if (chat.isRunning()) {
            TG_CLIENT.sendMessage(chat.getId(), 'Surprise dank time! Type \'' + randomTime.getTexts()[0] + '\' for points!');
          }
        }, null, true);
      });
    }
  });
}, null, true);

// Inform server.
console.info("DankTimesBot is now running...");
