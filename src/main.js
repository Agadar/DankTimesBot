'use strict';

// External imports.
const nodeCleanup = require('node-cleanup');   // NodeJS library for running code on program exit.
const cron = require('cron'); // NodeJS library for scheduling cron jobs.

// Internal imports.
const fileIO = require('./file-io.js');
const Command = require('./command.js');
const TelegramClient = require('./telegram-client.js');
const Commands = require('./commands.js');
const ChatRegistry = require('./chat-registry.js');
const DankTimeScheduler = require('./dank-time-scheduler.js');

// Global variables.
const settings = fileIO.loadSettingsFromFile();
const chatRegistry = new ChatRegistry(fileIO.loadChatsFromFile());
const tgClient = new TelegramClient(settings.apiKey);
const commands = new Commands(tgClient, chatRegistry, '1.1.0');
const scheduler = new DankTimeScheduler(tgClient, commands, true);

// Register available Telegram bot commands.
tgClient.registerCommand(new Command('add_time', 'Adds a dank time. Format: [hour] [minute] [points] [text1] [text2] etc.', commands, commands.addTime, true));
tgClient.registerCommand(new Command('help', 'Shows the available commands.', commands, commands.help));
tgClient.registerCommand(new Command('leaderboard', 'Shows the leaderboard.', commands, commands.leaderBoard));
tgClient.registerCommand(new Command('remove_time', 'Removes a dank time. Format: [hour] [minute]', commands, commands.removeTime, true));
tgClient.registerCommand(new Command('reset', 'Resets the scores.', commands, commands.resetChat, true, true));
tgClient.registerCommand(new Command('settings', 'Shows the current settings.', commands, commands.chatSettings));
tgClient.registerCommand(new Command('set_daily_random_frequency', 'Sets the number of random dank times per day. Format: [number]', commands, commands.setDailyRandomTimes, true));
tgClient.registerCommand(new Command('set_daily_random_points', 'Sets the points for random daily dank times. Format: [number]', commands, commands.setDailyRandomTimesPoints, true));
tgClient.registerCommand(new Command('set_timezone', 'Sets the time zone. Format: [timezone]', commands, commands.setTimezone, true));
tgClient.registerCommand(new Command('start', 'Starts keeping track of scores.', commands, commands.startChat, true));
tgClient.registerCommand(new Command('stop', 'Stops keeping track of scores.', commands, commands.stopChat, true));
tgClient.setOnAnyText((msg) => {
  if (msg.text) {
    chatRegistry.getOrCreateChat(msg.chat.id).processMessage(msg.from.id, msg.from.username || 'anonymous', msg.text, msg.date);
  }
});

// Schedule to persist chats map to file every X minutes.
setInterval(function () {
  fileIO.saveChatsToFile(chatRegistry.getChats());
  console.info('Persisted data to file.');
}, settings.persistenceRate * 60 * 1000);

// Schedule to persist chats map to file on program exit.
nodeCleanup(function (exitCode, signal) {
  console.info('Persisting data to file before exiting...');
  fileIO.saveChatsToFile(chatRegistry.getChats());
});

  chatRegistry.getChats().forEach(chat => {
    if (chat.isRunning()) {
      chat.generateRandomDankTimes();
      scheduler.scheduleDankTimes(chat);
    }
  });

/** Generates random dank times daily for all chats at 00:00:00. */
new cron.CronJob('0 0 0 * * *', function () {
  console.info('Generating random dank times for all chats!');

  scheduler.reset();
  chatRegistry.getChats().forEach(chat => {
    if (chat.isRunning()) {
      chat.generateRandomDankTimes();
      scheduler.scheduleDankTimes(chat);
    }
  });
}, null, true);

// Inform server.
console.info("DankTimesBot is now running...");
