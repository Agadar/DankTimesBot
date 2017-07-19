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
;
// Global variables.
const settings = fileIO.loadSettingsFromFile();
const chatRegistry = new ChatRegistry(fileIO.loadChatsFromFile());
const releaseLog = fileIO.loadReleaseLogFromFile();
const tgClient = new TelegramClient(settings.apiKey);
const scheduler = new DankTimeScheduler(tgClient, true);
const commands = new Commands(tgClient, chatRegistry, scheduler, releaseLog, '1.2.0');

// Register available Telegram bot commands, after retrieving the bot name.
tgClient.retrieveBotName().then(() => {
  tgClient.registerCommand(new Command('addtime', 'adds a dank time. format: [hour] [minute] [points] [text1] [text2] etc.', commands, commands.addTime, true));
  tgClient.registerCommand(new Command('danktimes', 'shows the user-specified dank times', commands, commands.dankTimes));
  tgClient.registerCommand(new Command('help', 'shows the available commands', commands, commands.help));
  tgClient.registerCommand(new Command('leaderboard', 'shows the leaderboard', commands, commands.leaderBoard));
  tgClient.registerCommand(new Command('releases', 'shows the release log', commands, commands.releaseLog));
  tgClient.registerCommand(new Command('removetime', 'removes a dank time. format: [hour] [minute]', commands, commands.removeTime, true));
  tgClient.registerCommand(new Command('reset', 'resets the scores', commands, commands.resetChat, true, true));
  tgClient.registerCommand(new Command('setdailyrandomfrequency', 'sets the number of random dank times per day. format: [number]', commands, commands.setDailyRandomTimes, true));
  tgClient.registerCommand(new Command('setdailyrandompoints', 'sets the points for random daily dank times. format: [number]', commands, commands.setDailyRandomTimesPoints, true));
  tgClient.registerCommand(new Command('setmultiplier', 'sets the multiplier for the score of the first user to score. format: [number]', commands, commands.setMultiplier, true));
  tgClient.registerCommand(new Command('settimezone', 'sets the time zone. format: [timezone]', commands, commands.setTimezone, true));
  tgClient.registerCommand(new Command('settings', 'shows the current settings', commands, commands.chatSettings));
  tgClient.registerCommand(new Command('start', 'starts keeping track of scores and sending messages', commands, commands.startChat, true));
  tgClient.registerCommand(new Command('stop', 'stops keeping track of scores and sending messages', commands, commands.stopChat, true));
  tgClient.registerCommand(new Command('togglefirstnotifications', 'toggles whether this chat announces the first user to score', commands, commands.toggleFirstNotifications, true));
  tgClient.registerCommand(new Command('toggleautoleaderboards', 'toggles whether a leaderboard is auto-posted 1 minute after every dank time', commands, commands.toggleAutoLeaderboards, true));
  tgClient.registerCommand(new Command('toggledanktimenotifications', 'toggles whether notifications of normal dank times are sent', commands, commands.toggleNotifications, true));
  tgClient.setOnAnyText((msg) => {
    if (msg.migrate_to_chat_id) {
      // If the chat was migrated, then update the registry.
      chatRegistry.setChatId(msg.chat.id, msg.migrate_to_chat_id);
    }
    else if (msg.text) {
      // Else, just let the appropriate chat process the message.
      return chatRegistry.getOrCreateChat(msg.chat.id).processMessage(msg.from.id, msg.from.username || 'anonymous', msg.text, msg.date);
    }
  });
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

// Generate new random dank times and chedule everything.
chatRegistry.getChats().forEach(chat => {
  chat.generateRandomDankTimes();
  scheduler.scheduleAllOfChat(chat);
});

/** Generates random dank times daily for all chats and schedules notifications for them at every 00:00:00. */
new cron.CronJob('0 0 0 * * *', function () {
  console.info('Generating random dank times for all chats!');
  chatRegistry.getChats().forEach(chat => {
    if (chat.isRunning()) {

      // Unschedule
      scheduler.unscheduleRandomDankTimesOfChat(chat);
      scheduler.unscheduleAutoLeaderboardsOfChat(chat);

      // Generate random dank times
      chat.generateRandomDankTimes();

      // Reschedule
      scheduler.scheduleRandomDankTimesOfChat(chat);
      scheduler.scheduleAutoLeaderboardsOfChat(chat);
    }
  });
}, null, true);

// Send a release log message to all chats, assuming there are release logs.
if (releaseLog.length > 0) {

  // Prepare message.
  let message = '<b>--- What\'s new in version ' + releaseLog[0].version + ' ? ---</b>\n\n';
  releaseLog[0].changes.forEach(change => {
    message += '- ' + change + '\n';
  });

  // Send it to all chats.
  chatRegistry.getChats().forEach(chat => {
    tgClient.sendMessage(chat._id, message);
  });
}

// Inform server.
console.info("Bot is now running!");
