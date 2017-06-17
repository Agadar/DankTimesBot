'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api'); // Client library for Telegram API.
const fileIO      = require('./file-io.js');          // Custom script for file I/O related stuff.
const util        = require('./util.js');             // Custom script containing global utility functions.
const time        = require('time')(Date);            // NodeJS library for working with timezones.
const cron        = require('cron');                  // NodeJS library for scheduling cron jobs.
const nodeCleanup = require('node-cleanup');          // NodeJS library for running code on program exit.

// Global variables.
const VERSION   = '1.1.0';
const SETTINGS  = fileIO.loadSettingsFromFile();
const CHATS     = fileIO.loadChatsFromFile(); // All the scores of all the chats, loaded from data file.
const BOT       = new TelegramBot(SETTINGS.apiKey, { polling: true });
const COMMANDS  = new Map(); // All the available settings of this bot.

// Register available Telegram bot commands.
newCommand('/add_time', 'Adds a dank time. Format: [text] [hour] [minute] [points]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, addTime));
newCommand('/help', 'Shows the available commands.', (msg) => help(msg));
newCommand('/leaderboard', 'Shows the leaderboard.', (msg) => leaderBoard(msg));
newCommand('/remove_time', 'Removes a dank time. Format: [text]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, removeTime));
newCommand('/reset', 'Resets the scores.', (msg, match) => callFunctionIfUserIsAdmin(msg, match, resetChat));
newCommand('/settings', 'Shows the current settings.', (msg) => chatSettings(msg));
newCommand('/set_daily_random_frequency', 'Sets the number of random dank times per day. Format: [number]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setDailyRandomTimes));
newCommand('/set_daily_random_points', 'Sets the points for random daily dank times. Format: [number]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setDailyRandomTimesPoints));
newCommand('/set_timezone', 'Sets the time zone. Format: [timezone]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setTimezone));
newCommand('/start', 'Starts keeping track of scores.', (msg, match) => callFunctionIfUserIsAdmin(msg, match, startChat));

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

  // If the chat is running and the dank time exists, continue.
  if (chat.running) {
    msg.text = util.cleanText(msg.text);  // Clean me, senpai (づ｡◕‿‿◕｡)づ
    const dankTime = chat.dankTimes.has(msg.text) ? chat.dankTimes.get(msg.text) : chat.randomDankTimes.get(msg.text);
    
    if (dankTime) {

      // Get user, shouted dank time, and server time.
      const user = chat.users.has(msg.from.id) ? chat.users.get(msg.from.id) : newUser(msg.from.id, msg.from.username, chat);
      const serverDate = new Date();
      serverDate.setTimezone(chat.timezone);

      // If the times match...
      if (serverDate.getHours() === dankTime.hour && (serverDate.getMinutes() === dankTime.minute 
        || new Date(msg.date * 1000).getMinutes() === dankTime.minute)) {
        
        if (chat.lastTime !== dankTime.shoutout) {  // If cache needs resetting, do so and award points.
          for (const chatUser of chat.users) {
            chatUser[1].called = false;
          }
          chat.lastTime = dankTime.shoutout;
          // Player is the first one calling this dank time. Award double points.
          user.score            += dankTime.points * 2;
          user.lastScoreChange  += dankTime.points * 2;
          user.called            = true;
        } else if (user.called) { // Else if user already called this time, remove points.
          user.score -= dankTime.points;
          user.lastScoreChange -= dankTime.points;
        } else {  // Else, award point.
          user.score += dankTime.points;
          user.lastScoreChange += dankTime.points;
          user.called = true;
        }
      } else {
        user.score -= dankTime.points;
        user.lastScoreChange -= dankTime.points;
      }
    }
  }
});

/** Generates random dank times daily for all chats at 00:00:00. */
new cron.CronJob('0 0 0 * * *', function() {
  console.info('Generating random dank times for all chats!');

  for (const chat of CHATS) {    
    if (chat[1].running) {
      chat[1].randomDankTimes.clear();
      for (let i = 0; i < chat[1].numberOfRandomTimes; i++) {

        // Generate random dank time.
        const date = new Date();
        date.setHours(date.getHours() + Math.floor(Math.random() * 23));
        date.setMinutes(Math.floor(Math.random() * 59));
        date.setTimezone(chat[1].timezone);
        const shoutout = util.padNumber(date.getHours().toString()) + util.padNumber(date.getMinutes().toString());
        const time = {shoutout: shoutout, hour: date.getHours(), minute: date.getMinutes(), points: chat[1].pointsPerRandomTime};
        chat[1].randomDankTimes.set(shoutout, time);

        // Schedule cron job that informs the chat when the time has come.
        new cron.CronJob(date, function() {
          if (chat[1].running) {
            sendMessageOnFailRemoveChat(chat[1].id, 'Surprise dank time! Type \'' + time.shoutout + '\' for points!');
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
 * Starts the specified chat so that it records dank time shoutouts.
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
  const users = util.mapToSortedArray(chat.users, util.compareUsers);
  let message = 'Leaderboard has been reset!\n\n<b>Final leaderboard:</b>';

  for (const user of users) {
    const scoreChange = (user.lastScoreChange > 0 ? '(+' + user.lastScoreChange + ')' : (user.lastScoreChange < 0 ? '(' + user.lastScoreChange + ')' : ''));
    message += '\n' + user.name + ':    ' + user.score + ' ' + scoreChange;
    user.score = 0;
    user.called = false;
    user.lastScoreChange = 0;
  }
  sendMessageOnFailRemoveChat(chat.id, message, {parse_mode: 'HTML'});
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function chatSettings(msg) {
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);
  const dankTimes = util.mapToSortedArray(chat.dankTimes, util.compareDankTimes);

  let settings = '\n<b>Chat time zone:</b> ' + chat.timezone;
  settings += '\n<b>Dank times:</b>';
  for (const time of dankTimes) {
    settings += "\ntime: " + util.padNumber(time.hour) + ":" + util.padNumber(time.minute) + ":00    word: '" + time.shoutout + "'    points: " + time.points;
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
  const users = util.mapToSortedArray(chat.users, util.compareUsers);

  // Build a string to send from the chat's user list.
  let leaderboard = '<b>Leaderboard:</b>';
  for (const user of users) {
   const scoreChange = (user.lastScoreChange > 0 ? '(+' + user.lastScoreChange + ')' : (user.lastScoreChange < 0 ? '(' + user.lastScoreChange + ')' : ''));
    leaderboard += '\n' + user.name + ':    ' + user.score + ' ' + scoreChange;
    user.lastScoreChange = 0;
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
    help += '\n' + command[0] + '    ' + command[1].description;
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
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /add_time [text] [hour] [minute] [points]');
    return;
  }

  // Identify arguments and validate them.
  const hour = Number(split[2]);
  if (hour === NaN || hour < 0 || hour > 23 || hour % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The hour must be a whole number between 0 and 23!');
    return;
  }
  const minute = Number(split[3]);
  if (minute === NaN || minute < 0 || minute > 59 || minute % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The minute must be a whole number between 0 and 59!');
    return;
  }
  const points = Number(split[4]);
  if (points === NaN || points < 1 || points % 1 !== 0) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'The points must be a whole number greater than 0!');
    return;
  }

  // Subscribe new dank time for the chat.
  newDankTime(split[1], hour, minute, points, chat);
  sendMessageOnFailRemoveChat(msg.chat.id, 'Added the new time!');
}

/**
 * Removes a dank time from the chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to remove a dank time from.
 */
function removeTime(msg, match, chat) {

  // Split string and ensure it contains at least 1 item.
  const split = match.input.split(' ');
  if (split.length < 2) {
    sendMessageOnFailRemoveChat(msg.chat.id, 'Not enough arguments! Format: /remove_time [text]');
    return;
  }

  // Remove the time from the chat.
  chat.dankTimes.delete(split[1]);
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
  sendMessageOnFailRemoveChat(msg.chat.id, 'Updated the points for random daily dank times!');
}


// --------------------OBJECT FACTORIES-------------------- //


/**
 * Creates a new user object and places it in the supplied chat's users map. 
 * It has the following fields:
 * - id: The user's unique Telegram id;
 * - name: The user's Telegram name;
 * - score: The user's score, starting at 0;
 * - called: Whether the user already called the current dank time;
 * - lastScoreChange The user's last score change, reset with every leaderboard.
 * @param {number} id The user's unique Telegram id.
 * @param {string} name The user's Telegram name.
 * @param {Chat} chat The chat to which the user belongs.
 * @return {User} New user.
 */
function newUser(id, name, chat) {
  const user = {id: id, name: name, score: 0, called: false, lastScoreChange: 0};
  chat.users.set(id, user);
  return user;
}

/**
 * Creates a new chat object with default dank times, and places it in 'chats'. 
 * It has the following fields:
 * - id: The chat's unique Telegram id;
 * - users: A map with the users, indexed by user id's;
 * - lastTime: The current dank time being shouted out;
 * - running: Whether this bot is running for this chat;
 * - dankTimes: The dank times known in this chat. Contains a few default ones;
 * - randomDankTimes: The daily randomly generated dank times in this chat;
 * - numberOfRandomTimes: The number of randomly generated dank times to generate each day;
 * - pointsPerRandomTime: The number of points each randomly generated dank time is worth;
 * - timezone: The timezone the users are in. 'Europe/Amsterdam' by default.
 * @param {number} id The chat's unique Telegram id.
 * @return {Chat} New chat.
 */
function newChat(id) {
  const chat = {id: id, users: new Map(), lastTime: undefined, running: false, dankTimes: new Map(),
    randomDankTimes: new Map(), numberOfRandomTimes: 1, pointsPerRandomTime: 10, timezone: 'Europe/Amsterdam'};
  newDankTime('1337', 13, 37, 10, chat);
  newDankTime('420', 16, 20, 10, chat);
  newDankTime('1234', 12, 34, 5, chat);
  newDankTime('1111', 11, 11, 5, chat);
  newDankTime('2222', 22, 22, 5, chat);
  CHATS.set(id, chat);
  return chat;
}

/**
 * Creates a new dank time object and places it in the supplied chat's dank times.
 * It has the following fields:
 * - shoutout: The string to shout to get the point;
 * - hour: The hour to shout at;
 * - minute: The minute to shout at;
 * - points: The amount of points the time is worth.
 * @param {string} shoutout The string to shout to get the point.
 * @param {number} hour The hour to shout at.
 * @param {number} minute The minute to shout at.
 * @param {number} points The amount of points the time is worth.
 * @param {Chat} chat The chat to place the dank times in.
 * @return {DankTime} New dank time.
 */
function newDankTime(shoutout, hour, minute, points, chat) {
  const dankTime = {shoutout: shoutout, hour: hour, minute: minute, points: points};
  chat.dankTimes.set(shoutout, dankTime);
  return dankTime;
}

/**
 * Creates a new bot command, places it in 'commands', and registers it with the Telegram bot.
 * It has the following fields:
 * - name: The name of the command, e.g. '/start';
 * - regex: The regex of the command, derived from 'name';
 * - description: Brief description of the command;
 * - _function: The function which this command calls.
 * @param {string} name The name of the command, e.g. '/start'.
 * @param {string} description Brief description of the command.
 * @param {function} _function The function which this command calls.
 * @return {Command} New command.
 */
function newCommand(name, description, _function) {
  const regex = RegExp(name + '(@DankTimesBot|)');
  const command = {name: name, regex: regex, description: description, _function: _function};
  COMMANDS.set(name, command);
  BOT.onText(command.regex, command._function);
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
