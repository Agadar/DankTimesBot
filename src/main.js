'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api'); // Client library for Telegram API.
const fileIO = require('./file-io.js');          // Custom script for file I/O related stuff.
const util = require('./util.js');             // Custom script containing global utility functions.
const time = require('time')(Date);            // NodeJS library for working with timezones.
const cron = require('cron');                  // NodeJS library for scheduling cron jobs.
const nodeCleanup = require('node-cleanup');          // NodeJS library for running code on program exit.

const DankTime = require('./dank-time.js');
const User = require('./user.js');
const Command = require('./command.js');
const Chat = require('./chat.js');

// Global variables.
const VERSION = '1.1.0';
const SETTINGS = fileIO.loadSettingsFromFile();
const CHATS = fileIO.loadChatsFromFile(); // All the scores of all the chats, loaded from data file.
const BOT = new TelegramBot(SETTINGS.apiKey, { polling: true });
const COMMANDS = new Map(); // All the available settings of this bot.

// Register available Telegram bot commands.
newCommand('add_time', 'Adds a dank time. Format: [hour] [minute] [points] [text1] [text2] etc.', (msg, match) => callFunctionIfUserIsAdmin(msg, match, addTime));
newCommand('help', 'Shows the available commands.', (msg) => help(msg));
newCommand('leaderboard', 'Shows the leaderboard.', (msg) => leaderBoard(msg));
newCommand('remove_time', 'Removes a dank time. Format: [hour] [minute]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, removeTime));
newCommand('reset', 'Resets the scores.', (msg, match) => callFunctionIfUserIsAdmin(msg, match, resetChat));
newCommand('settings', 'Shows the current settings.', (msg) => chatSettings(msg));
newCommand('set_daily_random_frequency', 'Sets the number of random dank times per day. Format: [number]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setDailyRandomTimes));
newCommand('set_daily_random_points', 'Sets the points for random daily dank times. Format: [number]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setDailyRandomTimesPoints));
newCommand('set_timezone', 'Sets the time zone. Format: [timezone]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setTimezone));
newCommand('start', 'Starts keeping track of scores.', (msg, match) => callFunctionIfUserIsAdmin(msg, match, startChat));

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

/** Activated on any message. Checks for dank times. */
BOT.on('message', (msg) => {
  if (msg.text) {
    const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id)
    chat.processMessage(msg.from.id, msg.from.username || 'anonymous', msg.text, msg.date);
  }
});

/** Generates random dank times daily for all chats at 00:00:00. */
new cron.CronJob('0 0 0 * * *', function () {
  console.info('Generating random dank times for all chats!');

  CHATS.forEach(chat => {
    if (chat.isRunning()) {
      chat.generateRandomDankTimes().forEach(randomTime => {
        new cron.CronJob('0 ' + chat.getMinutes() + ' ' + chat.getHours() + ' * * *', function () {
          if (chat.isRunning()) {
            sendMessageOnFailRemoveChat(chat.getId(), 'Surprise dank time! Type \'' + randomTime.getTexts()[0] + '\' for points!');
          }
        }, null, true);
      });
    }
  });
}, null, true);


// --------------------FUNCTIONS CALLED BY TELEGRAM BOT COMMANDS-------------------- //


/**
 * Calls the specified function, but only if the calling user is
 * an admin in his chat, or it is a private chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any} match The matched regex.
 * @param {function} _function The function to call. Should have parameters msg, match, chat.
 */
function callFunctionIfUserIsAdmin(msg, match, _function) {

  // Get the right chat.
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);

  // Only groups have admins, so if this chat isn't a group, continue straight to callback.
  if (msg.chat.type === 'private') {
    _function(msg, match, chat);
    return;
  }

  // Else if this chat is a group, then we must make sure the user is an admin.
  const promise = BOT.getChatAdministrators(msg.chat.id);
  promise.then(admins => {

    // Check to ensure user is admin. If not, post message.
    for (const admin of admins) {
      if (admin.user.id === msg.from.id) {
        _function(msg, match, chat);
        return;
      }
    }
    sendMessageOnFailRemoveChat(msg.chat.id, 'This option is only available to admins!');
  }).catch(reason => {
    console.error('Failed to retrieve admin list!\n' + reason);
    sendMessageOnFailRemoveChat('Failed to retrieve admin list! See server console.');
  });
}

/**
 * Starts the specified chat so that it records dank time texts.
 * Only prints a warning if the chat is already running.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to start.
 */
function startChat(msg, match, chat) {
  if (chat.isRunning()) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'DankTimesBot is already running!');
  } else {
    chat.setRunning(true);
    sendMessageOnFailRemoveChat(msg.chat.id, 'DankTimesBot is now running! Hit \'/help\' for available commands.');
  }
}

/**
 * Resets the scores of the specified chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to reset. 
 */
function resetChat(msg, match, chat) {
  let message = 'Leaderboard has been reset!\n\n<b>Final leaderboard:</b>';

  for (const user of chat.getUsers()) {
    const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' :
      (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
    message += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
  }
  chat.resetScores();
  sendMessageOnFailRemoveChat(msg.chat.id, message, { parse_mode: 'HTML' });
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function chatSettings(msg) {
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);

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
  sendMessageOnFailRemoveChat(msg.chat.id, settings, { parse_mode: 'HTML' });
}

/**
 * Prints the leaderboard of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function leaderBoard(msg) {

  // Get the chat, creating it if needed.
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);

  // Build a string to send from the chat's user list.
  let leaderboard = '<b>Leaderboard:</b>';
  for (const user of chat.getUsers()) {
    const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' : (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
    leaderboard += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
    user.resetLastScoreChange();
  }
  sendMessageOnFailRemoveChat(msg.chat.id, leaderboard, { parse_mode: 'HTML' });
}

/**
 * Prints the available commands to the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function help(msg) {
  let help = '<b>Available commands:</b>';
  COMMANDS.forEach(command => help += '\n/' + command.getName() + '    ' + command.getDescription());
  sendMessageOnFailRemoveChat(msg.chat.id, help, { parse_mode: 'HTML' });
}

/**
 * Adds a new dank time to the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to add a dank time to.
 */
function addTime(msg, match, chat) {

  // Split string and ensure it contains at least 4 items.
  const split = match.input.split(' ');
  if (split.length < 5) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /add_time [hour] [minute] [points] [text1] [text2] etc.');
    return;
  }

  // Identify arguments.
  const hour = Number(split[1]);
  const minute = Number(split[2]);
  const points = Number(split[3]);
  const texts = split.splice(4);

  // Subscribe new dank time for the chat, replacing any with the same hour and minute.
  try {
    const dankTime = new DankTime(hour, minute, texts, points);
    chat.addDankTime(dankTime);
    sendMessageOnFailRemoveChat(msg.chat.id, 'Added the new time!');
  } catch (err) {
    sendMessageOnFailRemoveChat(msg.chat.id, err.message);
  }
}

/**
 * Removes a dank time from the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to remove a dank time from.
 */
function removeTime(msg, match, chat) {

  // Split string and ensure it contains at least 2 items.
  const split = match.input.split(' ');
  if (split.length < 3) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /remove_time [hour] [minute]');
    return;
  }

  // Identify arguments and validate them.
  const hour = Number(split[1]);
  if (hour === NaN || hour < 0 || hour > 23 || hour % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The hour must be a whole number between 0 and 23!');
    return;
  }
  const minute = Number(split[2]);
  if (minute === NaN || minute < 0 || minute > 59 || minute % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The minute must be a whole number between 0 and 59!');
    return;
  }

  // Remove dank time if it exists, otherwise just send an info message.
  if (chat.removeDankTime(hour, minute)) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Removed the time!')
  } else {
    sendMessageOnFailRemoveChat(msg.chat.id, 'No dank time known with that hour and minute!');
  }
}

/**
 * Updated the chat's time zone.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to remove a dank time from.
 */
function setTimezone(msg, match, chat) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /set_timezone [timezone]');
    return;
  }

  // Update the time zone.
  try {
    chat.setTimezone(split[1]);
    sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the time zone!');
  } catch (err) {
    sendMessageOnFailRemoveChat(msg.chat.id, err.message);
  }
}

/**
 * Sets the number of random dank times per day for the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to set the daily random times frequency of.
 */
function setDailyRandomTimes(msg, match, chat) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /set_daily_random_frequency [number]');
    return;
  }

  // Do the update.
  try {
    chat.setNumberOfRandomTimes(Number(split[1]));
    sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the number of random dank times per day!');
  } catch (err) {
    sendMessageOnFailRemoveChat(msg.chat.id, err.message);
  }
}

/**
 * Sets the points for random daily dank times for the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to set the daily random time points of.
 */
function setDailyRandomTimesPoints(msg, match, chat) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /set_daily_random_points [number]');
    return;
  }

  try {
    chat.setPointsPerRandomTime(Number(split[1]));
    sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the points for random daily dank times!')
  } catch (err) {
    sendMessageOnFailRemoveChat(msg.chat.id, err.message);
  }
}

/**
 * Creates a new chat object with default dank times, and places it in 'chats'. 
 * @param {number} id The chat's unique Telegram id.
 * @return {Chat} New chat.
 */
function newChat(id) {
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
}

/**
 * Creates a new bot command, places it in 'commands', and registers it with the Telegram bot.
 * @param {string} name The name of the command, e.g. 'start'.
 * @param {string} description Brief description of the command.
 * @param {function} _function The function which this command calls.
 * @returns {Command} New command.
 */
function newCommand(name, description, _function) {
  const command = new Command(name, description, _function);
  COMMANDS.set(name, command);
  BOT.onText(command.getRegex(), command.getFunction());
  return command;
}

/**
 * Attempts to send a message to the chat. If a 403 error is returned, then the
 * chat data is removed because that means the chat removed the bot.
 * @param {number} chatId The chat to send the message to.
 * @param {string} msg The message to send.
 */
function sendMessageOnFailRemoveChat(chatId, msg, options) {
  BOT.sendMessage(chatId, msg, options).catch(reason => {
    if (reason.response.statusCode === 403) {
      CHATS.delete(chatId);
      console.info('Chat with id ' + chatId + ' removed the bot, removed chat data in revenge.');
    }
  });
}

// Inform server.
console.info("DankTimesBot is now running...");
