'use strict';

// External imports.
const time = require('time')(Date);            // NodeJS library for working with timezones.
const cron = require('cron');                  // NodeJS library for scheduling cron jobs.
const nodeCleanup = require('node-cleanup');   // NodeJS library for running code on program exit.

// Internal imports.
const fileIO = require('./file-io.js');          // Custom script for file I/O related stuff.
const util = require('./util.js');               // Custom script containing global utility functions.
const DankTime = require('./dank-time.js');
const User = require('./user.js');
const Command = require('./command.js');
const Chat = require('./chat.js');
const TelegramClient = require('./telegram-client.js');

// Global variables.
const VERSION = '1.1.0';
const SETTINGS = fileIO.loadSettingsFromFile();
const CHATS = fileIO.loadChatsFromFile(); // All the scores of all the chats, loaded from data file.
const TG_CLIENT = new TelegramClient(SETTINGS.apiKey);

// Register available Telegram bot commands.
TG_CLIENT.registerCommand(new Command('add_time', 'Adds a dank time. Format: [hour] [minute] [points] [text1] [text2] etc.', addTime, true));
TG_CLIENT.registerCommand(new Command('help', 'Shows the available commands.', help));
TG_CLIENT.registerCommand(new Command('leaderboard', 'Shows the leaderboard.', leaderBoard));
TG_CLIENT.registerCommand(new Command('remove_time', 'Removes a dank time. Format: [hour] [minute]', removeTime, true));
TG_CLIENT.registerCommand(new Command('reset', 'Resets the scores.', resetChat, true, true));
TG_CLIENT.registerCommand(new Command('settings', 'Shows the current settings.', chatSettings));
TG_CLIENT.registerCommand(new Command('set_daily_random_frequency', 'Sets the number of random dank times per day. Format: [number]', setDailyRandomTimes, true));
TG_CLIENT.registerCommand(new Command('set_daily_random_points', 'Sets the points for random daily dank times. Format: [number]', setDailyRandomTimesPoints, true));
TG_CLIENT.registerCommand(new Command('set_timezone', 'Sets the time zone. Format: [timezone]', setTimezone, true));
TG_CLIENT.registerCommand(new Command('start', 'Starts keeping track of scores.', startChat, true));
TG_CLIENT.setOnAnyText((msg) => {
  if (msg.text) {
    getOrCreateChat(msg.chat.id).processMessage(msg.from.id, msg.from.username || 'anonymous', msg.text, msg.date);
  }
});

// Schedule to persist chats map to file every X minutes.
setInterval(function () {
  fileIO.saveChatsToFile(CHATS);
  console.info('Persisted data to file.');
}, SETTINGS.persistenceRate * 60 * 1000);

// Schedule to persist chats map to file on program exit.
nodeCleanup(function (exitCode, signal) {
  console.info('Persisting data to file before exiting...');
  fileIO.saveChatsToFile(CHATS);
});

/** Generates random dank times daily for all chats at 00:00:00. */
new cron.CronJob('0 0 0 * * *', function () {
  console.info('Generating random dank times for all chats!');

  CHATS.forEach(chat => {
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


// --------------------FUNCTIONS CALLED BY TELEGRAM BOT COMMANDS-------------------- //

/**
 * Starts the specified chat so that it records dank time texts.
 * Only prints a warning if the chat is already running.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @returns {string} The response.
 */
function startChat(msg, match) {
  const chat = getOrCreateChat(msg.chat.id);
  if (chat.isRunning()) {
    return 'DankTimesBot is already running!';
  }
  chat.setRunning(true);
  return 'DankTimesBot is now running! Hit \'/help\' for available commands.';
}

/**
 * Resets the scores of the specified chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function resetChat(msg, match) {
  const chat = getOrCreateChat(msg.chat.id);
  let message = 'Leaderboard has been reset!\n\n<b>Final leaderboard:</b>';

  for (const user of chat.getUsers()) {
    const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' :
      (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
    message += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
  }
  chat.resetScores();
  return message;
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function chatSettings(msg, match) {
  const chat = getOrCreateChat(msg.chat.id);

  let settings = '\n<b>Chat time zone:</b> ' + chat.getTimezone() + '\n<b>Dank times:</b>';
  for (const time of chat.getDankTimes()) {
    settings += "\ntime: " + util.padNumber(time.getHour()) + ":" + util.padNumber(time.getMinute()) + ":00    points: " + time.getPoints() + "    texts:";
    for (let text of time.getTexts()) {
      settings += " " + text;
    }
  }
  settings += '\n<b>Random dank times per day:</b> ' + chat.getNumberOfRandomTimes();
  settings += '\n<b>Random dank time points:</b> ' + chat.getPointsPerRandomTime();
  settings += '\n<b>Server time:</b> ' + new Date();
  settings += '\n<b>Status:</b> ' + (chat.isRunning() ? 'running' : 'awaiting start');
  settings += '\n<b>Version:</b> ' + VERSION;
  return settings;
}

/**
 * Prints the leaderboard of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function leaderBoard(msg, match) {

  // Build a string to send from the chat's user list.
  let leaderboard = '<b>Leaderboard:</b>';
  for (const user of getOrCreateChat(msg.chat.id).getUsers()) {
    const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' : (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
    leaderboard += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
    user.resetLastScoreChange();
  }
  return leaderboard;
}

/**
 * Prints the available commands to the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function help(msg, match) {
  let help = '<b>Available commands:</b>';
  TG_CLIENT.getCommands().forEach(command => help += '\n/' + command.getName() + '    ' + command.getDescription());
  return help;
}

/**
 * Adds a new dank time to the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function addTime(msg, match) {

  // Split string and ensure it contains at least 4 items.
  const split = match.input.split(' ');
  if (split.length < 5) {
    return 'Not enough arguments! Format: /add_time [hour] [minute] [points] [text1] [text2] etc.';
  }

  // Identify arguments.
  const hour = Number(split[1]);
  const minute = Number(split[2]);
  const points = Number(split[3]);
  const texts = split.splice(4);

  // Subscribe new dank time for the chat, replacing any with the same hour and minute.
  try {
    const dankTime = new DankTime(hour, minute, texts, points);
    getOrCreateChat(msg.chat.id).addDankTime(dankTime);
    return 'Added the new time!';
  } catch (err) {
    return err.message;
  }
}

/**
 * Removes a dank time from the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function removeTime(msg, match) {

  // Split string and ensure it contains at least 2 items.
  const split = match.input.split(' ');
  if (split.length < 3) {
    return 'Not enough arguments! Format: /remove_time [hour] [minute]';
  }

  // Identify arguments and validate them.
  const hour = Number(split[1]);
  if (hour === NaN || hour < 0 || hour > 23 || hour % 1 !== 0) {
    return 'The hour must be a whole number between 0 and 23!';
  }
  const minute = Number(split[2]);
  if (minute === NaN || minute < 0 || minute > 59 || minute % 1 !== 0) {
    return 'The minute must be a whole number between 0 and 59!';
  }

  // Remove dank time if it exists, otherwise just send an info message.
  if (getOrCreateChat(msg.chat.id).removeDankTime(hour, minute)) {
    return 'Removed the time!'
  } else {
    return 'No dank time known with that hour and minute!';
  }
}

/**
 * Updated the chat's time zone.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function setTimezone(msg, match) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    return 'Not enough arguments! Format: /set_timezone [timezone]';
  }

  // Update the time zone.
  try {
    getOrCreateChat(msg.chat.id).setTimezone(split[1]);
    return 'Updated the time zone!';
  } catch (err) {
    return err.message;
  }
}

/**
 * Sets the number of random dank times per day for the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function setDailyRandomTimes(msg, match) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    return 'Not enough arguments! Format: /set_daily_random_frequency [number]';
  }

  // Do the update.
  try {
    getOrCreateChat(msg.chat.id).setNumberOfRandomTimes(Number(split[1]));
    return 'Updated the number of random dank times per day!';
  } catch (err) {
    return err.message;
  }
}

/**
 * Sets the points for random daily dank times for the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api. 
 * @returns {string} The response.
 */
function setDailyRandomTimesPoints(msg, match, chat) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    return 'Not enough arguments! Format: /set_daily_random_points [number]';
  }

  try {
    getOrCreateChat(msg.chat.id).setPointsPerRandomTime(Number(split[1]));
    return 'Updated the points for random daily dank times!';
  } catch (err) {
    return err.message;
  }
}

/**
 * Gets the chat with the supplied id, otherwise creates and returns a new one.
 * @param {number} id The chat's unique Telegram id.
 * @returns {Chat} The (possibly new) chat.
 */
function getOrCreateChat(id) {
  if (CHATS.has(id)) {
    return CHATS.get(id);
  }
  const chat = new Chat(id);
  chat.addDankTime(new DankTime(0, 0, ['0000'], 5));
  chat.addDankTime(new DankTime(4, 20, ['420'], 15));
  chat.addDankTime(new DankTime(11, 11, ['1111'], 5));
  chat.addDankTime(new DankTime(12, 34, ['1234'], 5));
  chat.addDankTime(new DankTime(13, 37, ['1337'], 10));
  chat.addDankTime(new DankTime(16, 20, ['420'], 10));
  chat.addDankTime(new DankTime(22, 22, ['2222'], 5));
  CHATS.set(id, chat);
  return chat;
};

// Inform server.
console.info("DankTimesBot is now running...");
