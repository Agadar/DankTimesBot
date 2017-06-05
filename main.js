'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api'); // JS client library for Telegram API.
const fileIO = require('./file-io.js'); // Custom script for file I/O related stuff.
const time = require('time')(Date); // NodeJS library for working with timezones.

// Global variables.
const SETTINGS      = fileIO.loadSettingsFromFile();
const CHATS         = fileIO.loadChatsFromFile(); // All the scores of all the chats, loaded from data file.
const BOT           = new TelegramBot(SETTINGS.apiKey, {polling: true});
const COMMANDS      = new Map(); // All the available settings of this bot.

// Register available Telegram bot commands.
newCommand('/add_time', 'Adds a dank time. Format: [text] [hour] [minute] [points]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, addTime));
newCommand('/help', 'Shows the available commands', (msg) => help(msg));
newCommand('/leaderboard', 'Shows the leaderboard', (msg) => leaderBoard(msg));
newCommand('/remove_time', 'Removes a dank time. Format: [text]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, removeTime));
newCommand('/reset', 'Resets the scores', (msg, match) => callFunctionIfUserIsAdmin(msg, match, resetChat));
newCommand('/settings', 'Shows the current settings', (msg) => chatSettings(msg));
newCommand('/set_timezone', 'Sets the time zone. Format: [timezone]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, setTimezone));
newCommand('/start', 'Starts keeping track of scores', (msg, match) => callFunctionIfUserIsAdmin(msg, match, startChat));

// Schedule NodeJS timer to persist chats map to file every X minutes.
setInterval(function() {
  fileIO.saveChatsToFile(CHATS);
}, SETTINGS.persistenceRate * 60 * 1000);

/** Activated on any message. Checks for dank times. */
BOT.on('message', (msg) => {

  // Get the chat, creating it if needed.
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id)

  // If the chat is running and the dank time exists, continue.
  if (chat.running && chat.dankTimes.has(msg.text)) {

    // Get user, shouted dank time, and server time.
    const user = chat.users.has(msg.from.id) ? chat.users.get(msg.from.id) : newUser(msg.from.id, msg.from.username, chat);
    const dankTime = chat.dankTimes.get(msg.text);
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
        user.score += dankTime.points;
        user.called = true;
      } else if (user.called) { // Else if user already called this time, remove points.
        user.score -= dankTime.points;
      } else {  // Else, award point.
        user.score += dankTime.points;
        user.called = true;
      }
    } else {
      user.score -= dankTime.points;
    }
  }
});


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
    BOT.sendMessage(chat.id, 'This option is only available to admins!');
  }).catch(reason => {
    console.error('Failed to retrieve admin list!\n' + reason);
    BOT.sendMessage('Failed to retrieve admin list! See server console.');
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
    BOT.sendMessage(chat.id, 'DankTimesBot is already running!');
  } else {
    chat.running = true;
    BOT.sendMessage(chat.id, 'DankTimesBot is now running! Hit \'/help\' for available commands.');
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
  for (const user of chat.users) {
    message += "\n" + user[1].name + ":    " + user[1].score;
    user[1].score = 0;
    user[1].called = false;
  }
  BOT.sendMessage(chat.id, message, {parse_mode: 'HTML'});
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function chatSettings(msg) {
  const chat = CHATS.has(msg.chat.id) ? CHATS.get(msg.chat.id) : newChat(msg.chat.id);
  let settings = '<b>Status:</b> ' + (chat.running ? 'running' : 'not running');
  settings += '\n<b>Time zone:</b> ' + chat.timezone;
  settings += '\n<b>Dank times:</b>';
  for (const time of chat.dankTimes) {
    settings += "\ntime: " + time[1].hour + ":" + time[1].minute + ":00    word: '" + time[0] + "'    points: " + time[1].points;
  }
  BOT.sendMessage(msg.chat.id, settings, {parse_mode: 'HTML'});
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
  for (const user of chat.users) {
    leaderboard += "\n" + user[1].name + ":    " + user[1].score;
  }
  BOT.sendMessage(msg.chat.id, leaderboard, {parse_mode: 'HTML'});
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
  BOT.sendMessage(msg.chat.id, help, {parse_mode: 'HTML'});
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
    BOT.sendMessage(msg.chat.id, 'Not enough arguments! Format: /add_time [text] [hour] [minute] [points]');
    return;
  }

  // Identify arguments and validate them.
  const hour = Number(split[2]);
  if (hour === NaN || hour < 0 || hour > 23 || hour % 1 !== 0) {
    BOT.sendMessage(msg.chat.id, 'The hour must be a whole number between 0 and 23!');
    return;
  }
  const minute = Number(split[3]);
  if (minute === NaN || minute < 0 || minute > 59 || minute % 1 !== 0) {
    BOT.sendMessage(msg.chat.id, 'The minute must be a whole number between 0 and 59!');
    return;
  }
  const points = Number(split[4]);
  if (points === NaN || points < 1 || points % 1 !== 0) {
    BOT.sendMessage(msg.chat.id, 'The points must be a whole number greater than 0!');
    return;
  }

  // Subscribe new dank time for the chat.
  newDankTime(split[1], hour, minute, points, chat);
  BOT.sendMessage(msg.chat.id, 'Added the new time!');
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
    BOT.sendMessage(msg.chat.id, 'Not enough arguments! Format: /remove_time [text]');
    return;
  }

  // Remove the time from the chat.
  chat.dankTimes.delete(split[1]);
  BOT.sendMessage(msg.chat.id, 'Removed the time!');
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
    BOT.sendMessage(msg.chat.id, 'Not enough arguments! Format: /set_timezone [timezone]');
    return;
  }

  // Validate the date.
  try {
    const date = new Date();
    date.setTimezone(split[1]);
  } catch (err) {
    BOT.sendMessage(msg.chat.id, 'Invalid time zone! Examples: \'Europe/Amsterdam\', \'UTC\'.');
    return;
  }

  // Update the time zone.
  chat.timezone = split[1];
  BOT.sendMessage(msg.chat.id, 'Updated the time zone!');
}


// --------------------OBJECT FACTORIES-------------------- //


/**
 * Creates a new user object and places it in the supplied chat's users map. 
 * It has the following fields:
 * - id: The user's unique Telegram id;
 * - name: The user's Telegram name;
 * - score: The user's score, starting at 0;
 * - called: Whether the user already called the current dank time.
 * @param {number} id The user's unique Telegram id.
 * @param {string} name The user's Telegram name.
 * @param {Chat} chat The chat to which the user belongs.
 * @return {User} New user.
 */
function newUser(id, name, chat) {
  const user = {id: id, name: name, score: 0, called: false};
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
 * - timezone: The timezone the users are in. 'Europe/Amsterdam' by default.
 * @param {number} id The chat's unique Telegram id.
 * @return {Chat} New chat.
 */
function newChat(id) {
  const chat = {id: id, users: new Map(), lastTime: undefined, running: false, dankTimes: new Map(), timezone: 'Europe/Amsterdam'};
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

// Inform server.
console.info("DankTimesBot is now running!");