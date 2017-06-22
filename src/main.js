'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api'); // Client library for Telegram API.
const fileIO      = require('./file-io.js');          // Custom script for file I/O related stuff.
const util        = require('./util.js');             // Custom script containing global utility functions.
const time        = require('time')(Date);            // NodeJS library for working with timezones.
const cron        = require('cron');                  // NodeJS library for scheduling cron jobs.
const nodeCleanup = require('node-cleanup');          // NodeJS library for running code on program exit.

const DankTime  = require('./dank-time.js');
const User      = require('./user.js');
const Command   = require('./command.js');
const Chat      = require('./chat.js');

// Global variables.
const VERSION   = '1.1.0';
const SETTINGS  = fileIO.loadSettingsFromFile();
const CHATS     = fileIO.loadChatsFromFile(); // All the scores of all the chats, loaded from data file.
const BOT       = new TelegramBot(SETTINGS.apiKey, { polling: true });
const COMMANDS  = new Map(); // All the available settings of this bot.

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
setInterval(function() {
  fileIO.saveChatsToFile(CHATS);
  console.info('Persisted data to file.');
}, SETTINGS.persistenceRate * 60 * 1000);

// Schedule to persist chats map to file on program exit.
nodeCleanup(function(exitCode, signal) {
  console.info('Persisting data to file before exiting...');
  fileIO.saveChatsToFile(CHATS);
});

/** Activated on any message. Checks for dank times. */
BOT.on('message', (msg) => {

  // Get the chat, creating it if needed.
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id)

  // If the chat is running, continue.
  if (chat.running) {
    msg.text = util.cleanText(msg.text);

    // Gather dank times from the sent text.
    const dankTimesByText = getDankTimesByText(msg.text, chat.dankTimes).concat(getDankTimesByText(msg.text, chat.randomDankTimes));
    if (dankTimesByText.length < 1) {
      return;
    }
    const user = chat.users.has(msg.from.id) ? chat.users.get(msg.from.id) : newUser(msg.from.id, msg.from.username, chat);
    const serverDate = new Date();
    serverDate.setTimezone(chat.timezone);
    let subtractBy = 0;

    for (let dankTime of dankTimesByText) {
      if (serverDate.getHours() === dankTime.getHour() && (serverDate.getMinutes() === dankTime.getMinute() 
        || new Date(msg.date * 1000).getMinutes() === dankTime.getMinute())) {
        
        // If cache needs resetting, do so and award DOUBLE points to the calling user.
        if (chat.lastTime.hour !== dankTime.getHour() || chat.lastTime.minute !== dankTime.getMinute()) {
          for (const chatUser of chat.users) {
            chatUser[1].setCalled(false);
          }
          chat.lastTime.hour     = dankTime.getHour();
          chat.lastTime.minute   = dankTime.getMinute();
          user.addToScore(dankTime.getPoints() * 2);
          user.setCalled(true);
        } else if (user.getCalled()) { // Else if user already called this time, remove points.
          user.addToScore(-dankTime.getPoints());
        } else {  // Else, award point.
          user.addToScore(dankTime.getPoints());
          user.setCalled(true);
        }
        return;
      } else if (dankTime.getPoints() > subtractBy) {
          subtractBy = dankTime.getPoints();
      }
    }
    // If no match was found, punish the user.
    user.addToScore(-subtractBy);
  }
});

/** Generates random dank times daily for all chats at 00:00:00. */
new cron.CronJob('0 0 0 * * *', function() {
  console.info('Generating random dank times for all chats!');

  for (const chat of CHATS) {    
    if (chat[1].running) {
      chat[1].randomDankTimes = new Array();
      for (let i = 0; i < chat[1].numberOfRandomTimes; i++) {

        // Generate random dank time.
        const date = new Date();
        date.setHours(date.getHours() + Math.floor(Math.random() * 23));
        date.setMinutes(Math.floor(Math.random() * 59));
        date.setTimezone(chat[1].timezone);
        const text = util.padNumber(date.getHours().toString()) + util.padNumber(date.getMinutes().toString());
        const time = newDankTime(date.getHours(), date.getMinutes(), chat[1].pointsPerRandomTime, [text], chat[1].randomDankTimes);

        // Schedule cron job that informs the chat when the time has come.
        new cron.CronJob(date, function() {
          if (chat[1].running) {
            sendMessageOnFailRemoveChat(chat[1].id, 'Surprise dank time! Type \'' + time.getTexts()[0] + '\' for points!');
          }
        }, null, true);
      }
    }
  }
}, null, true);


// --------------------FUNCTIONS CALLED BY TELEGRAM BOT COMMANDS-------------------- //


/**
 * Calls the specified function, but only if the calling user is
 * an admin in his chat, or it is a private chat.
 * @param {any} msg The message object from the Telegram api.
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
  const promise = BOT.getChatAdministrators(chat.id);  
  promise.then(admins => {

    // Check to ensure user is admin. If not, post message.
    for (const admin of admins) {
      if (admin.user.id === msg.from.id) {
        _function(msg, match, chat);
        return;
      }
    }
    sendMessageOnFailRemoveChat(chat.id, 'This option is only available to admins!');
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
  if (chat.running) {
    sendMessageOnFailRemoveChat(chat.id, 'DankTimesBot is already running!');
  } else {
    chat.running = true;
    sendMessageOnFailRemoveChat(chat.id, 'DankTimesBot is now running! Hit \'/help\' for available commands.');
  }
}

/**
 * Resets the scores of the specified chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to reset. 
 */
function resetChat(msg, match, chat) {
  const users = util.mapToSortedArray(chat.users, User.compare);
  let message = 'Leaderboard has been reset!\n\n<b>Final leaderboard:</b>';

  for (const user of users) {
    const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' : (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
    message += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
    user.resetScore();
  }
  sendMessageOnFailRemoveChat(chat.id, message, {parse_mode: 'HTML'});
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function chatSettings(msg) {
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);
  chat.dankTimes.sort(DankTime.compare);

  let settings = '\n<b>Chat time zone:</b> ' + chat.timezone + '\n<b>Dank times:</b>';
  for (const time of chat.dankTimes) {
    settings += "\ntime: " + util.padNumber(time.getHour()) + ":" + util.padNumber(time.getMinute()) + ":00    points: " + time.getPoints() + "    texts:";
    for (let text of time.getTexts()) {
      settings += " " + text;
    }
  }
  settings += '\n<b>Random dank times per day:</b> ' + chat.numberOfRandomTimes;
  settings += '\n<b>Random dank time points:</b> ' + chat.pointsPerRandomTime;
  settings += '\n<b>Server time:</b> ' + new Date();
  settings += '\n<b>Status:</b> ' + (chat.running ? 'running' : 'awaiting start');
  settings += '\n<b>Version:</b> ' + VERSION;
  sendMessageOnFailRemoveChat(msg.chat.id, settings, {parse_mode: 'HTML'});
}

/**
 * Prints the leaderboard of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function leaderBoard(msg) {

  // Get the chat, creating it if needed.
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);
  const users = util.mapToSortedArray(chat.users, User.compare);

  // Build a string to send from the chat's user list.
  let leaderboard = '<b>Leaderboard:</b>';
  for (const user of users) {
    const scoreChange = (user.getLastScoreChange() > 0 ? '(+' + user.getLastScoreChange() + ')' : (user.getLastScoreChange() < 0 ? '(' + user.getLastScoreChange() + ')' : ''));
    leaderboard += '\n' + user.getName() + ':    ' + user.getScore() + ' ' + scoreChange;
    user.resetLastScoreChange();
  }
  sendMessageOnFailRemoveChat(msg.chat.id, leaderboard, {parse_mode: 'HTML'});
}

/**
 * Prints the available commands to the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function help(msg) {
  let help = '<b>Available commands:</b>';
  for (const command of COMMANDS) {
    help += '\n' + command[1].getPrefixedName() + '    ' + command[1].getDescription();
  }
  sendMessageOnFailRemoveChat(msg.chat.id, help, {parse_mode: 'HTML'});
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
    newDankTime(hour, minute, points, texts, chat.dankTimes);
  } catch (err) {
    sendMessageOnFailRemoveChat(msg.chat.id, err.message);
    return;
  }
  sendMessageOnFailRemoveChat(msg.chat.id, 'Added the new time!');
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
  const removeMe = getDankTimeByHourMinute(hour, minute, chat.dankTimes);
  if (!removeMe) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'No dank time known with that hour and minute!');
    return;
  }

  // Remove the time from the chat.
  chat.dankTimes.splice(chat.dankTimes.indexOf(removeMe), 1);
  sendMessageOnFailRemoveChat(msg.chat.id, 'Removed the time!');
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

  // Validate the date.
  try {
    const date = new Date();
    date.setTimezone(split[1]);
  } catch (err) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Invalid time zone! Examples: \'Europe/Amsterdam\', \'UTC\'.');
    return;
  }

  // Update the time zone.
  chat.timezone = split[1];
  sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the time zone!');
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

  // Identify arguments and validate them.
  const frequency = Number(split[1]);
  if (frequency === NaN || frequency < 0 || frequency % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The frequency must be a whole number greater or equal to 0!');
    return;
  }

  // Do the update.
  chat.numberOfRandomTimes = frequency;
  chat.randomDankTimes.splice(frequency);
  sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the number of random dank times per day!');
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

  // Identify arguments and validate them.
  const points = Number(split[1]);
  if (points === NaN || points <= 0 || points % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The points must be a whole number greater than 0!');
    return;
  }

  // Do the update.
  chat.pointsPerRandomTime = points;
  for (let dankTime of chat.randomDankTimes) {
    dankTime.setPoints(points);
  }

  // Send informative message.
  sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the points for random daily dank times!');
}


// --------------------OBJECT FACTORIES-------------------- //


/**
 * Creates a new user object and places it in the supplied chat's users map. 
 * @param {number} id The user's unique Telegram id.
 * @param {string} name The user's Telegram name.
 * @param {Chat} chat The chat to which the user belongs.
 * @return {User} New user.
 */
function newUser(id, name, chat) {
  const user = new User(id, name);
  chat.users.set(id, user);
  return user;
}

/**
 * Creates a new chat object with default dank times, and places it in 'chats'. 
 * @param {number} id The chat's unique Telegram id.
 * @return {Chat} New chat.
 */
function newChat(id) {
  const chat = new Chat(id);
  chat.addDankTime(new DankTime(0,   0, ['0000'],  5));
  chat.addDankTime(new DankTime(4,  20, ['0000'], 15));
  chat.addDankTime(new DankTime(11, 11, ['0000'],  5));
  chat.addDankTime(new DankTime(12, 34, ['0000'],  5));
  chat.addDankTime(new DankTime(13, 37, ['0000'], 10));
  chat.addDankTime(new DankTime(16, 20, ['0000'], 10));
  chat.addDankTime(new DankTime(22, 22, ['0000'], 5));
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
