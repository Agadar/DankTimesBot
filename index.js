'use strict';

// Imports.
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs'); // For reading the file containing the API key.

// Global variables.
const bot = new TelegramBot(fs.readFileSync('./DankTimesBot.api', 'utf8'), {polling: true});
const chats = new Map(); // All the scores of all the chats.
const commands = new Map(); // All the available settings of this bot.

// Register available commands.
newCommand('/start', 'Starts keeping track of scores', (msg, match) => callFunctionIfUserIsAdmin(msg, match, startChat));
newCommand('/reset', 'Resets the scores', (msg, match) => callFunctionIfUserIsAdmin(msg, match, resetChat));
newCommand('/settings', 'Shows the current settings', (msg) => chatSettings(msg));
newCommand('/leaderboard', 'Shows the leaderboard', (msg) => leaderBoard(msg));
newCommand('/help', 'Shows the available commands', (msg) => help(msg));
newCommand('/add_time', 'Adds a dank time. Format: [text] [hour] [minute] [points]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, addTime));
newCommand('/remove_time', 'Removes a dank time. Format: [text]', (msg, match) => callFunctionIfUserIsAdmin(msg, match, removeTime));

/** Activated on any message. Checks for dank times. */
bot.on('message', (msg) => {

  // Get the chat, creating it if needed.
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id)

  // If the chat is running and the dank time exists, continue.
  if (chat.running && chat.dankTimes.has(msg.text)) {

    // Get user, shouted dank time, and server time.
    const user = chat.users.has(msg.from.id) ? chat.users.get(msg.from.id) : newUser(msg.from.id, msg.from.username, chat);
    const dankTime = chat.dankTimes.get(msg.text);
    const serverDate = new Date();
    
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

/**
 * Calls the specified function, but only if the calling user is
 * an admin in his chat, or it is a private chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {function} _function The function to call. Should have parameters msg, match, chat.
 */
function callFunctionIfUserIsAdmin(msg, match, _function) {

  // Get the right chat.
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);

  // Only groups have admins, so if this chat isn't a group, continue straight to callback.
  if (msg.chat.type === 'private') {
    _function(msg, match, chat);
    return;
  }

  // Else if this chat is a group, then we must make sure the user is an admin.
  const promise = bot.getChatAdministrators(chat.id);  
  promise.then(admins => {

    // Check to ensure user is admin. If not, post message.
    for (const admin of admins) {
      if (admin.user.id === msg.from.id) {
        _function(msg, match, chat);
        return;
      }
    }
    bot.sendMessage(chat.id, 'This option is only available to admins!');
  }).catch(reason => {
    console.error('Failed to retrieve admin list!\n' + reason);
    bot.sendMessage('Failed to retrieve admin list! See server console.');
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
    bot.sendMessage(chat.id, 'DankTimesBot is already running!');
  } else {
    chat.running = true;
    bot.sendMessage(chat.id, 'DankTimesBot is now running! Hit \'/help\' for available commands.');
  }
}

/**
 * Resets the scores of the specified chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @param {Chat} chat The chat to reset. 
 */
function resetChat(msg, match, chat) {
  let message = 'Leaderboard has been reset! Final score:\n';
  for (const user of chat.users) {
    message += "\n" + user[1].name + ":    " + user[1].score;
    user[1].score = 0;
    user[1].called = false;
  }
  bot.sendMessage(chat.id, message);
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function chatSettings(msg) {
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);
  let settings = 'Status:    ' + (chat.running ? 'running' : 'not running');
  settings += ';\nDank times:';
  for (const time of chat.dankTimes) {
    settings += "\n    time: " + time[1].hour + ":" + time[1].minute + ":00    word: '" + time[0] + "'    points: " + time[1].points;
  }
  bot.sendMessage(msg.chat.id, settings);
}

/**
 * Prints the leaderboard of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function leaderBoard(msg) {

  // Get the chat, creating it if needed.
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);

  // Build a string to send from the chat's user list.
  let leaderboard = 'Leaderboard:\n';
  for (const user of chat.users) {
    leaderboard += "\n" + user[1].name + ":    " + user[1].score;
  }
  bot.sendMessage(msg.chat.id, leaderboard);
}

/**
 * Prints the available commands to the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function help(msg) {
  let help = 'Available commands:';
  for (const command of commands) {
    help += '\n' + command[0] + '    ' + command[1].description;
  }
  bot.sendMessage(msg.chat.id, help);
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
    bot.sendMessage(msg.chat.id, 'Not enough arguments! Format: /add_time [text] [hour] [minute] [points]');
    return;
  }

  // Identify arguments and validate them.
  const hour = Number(split[2]);
  if (hour === NaN || hour < 0 || hour > 23 || hour % 1 !== 0) {
    bot.sendMessage(msg.chat.id, 'The hour must be a whole number between 0 and 23!');
    return;
  }
  const minute = Number(split[3]);
  if (minute === NaN || minute < 0 || minute > 59 || minute % 1 !== 0) {
    bot.sendMessage(msg.chat.id, 'The minute must be a whole number between 0 and 59!');
    return;
  }
  const points = Number(split[4]);
  if (points === NaN || points < 1 || points % 1 !== 0) {
    bot.sendMessage(msg.chat.id, 'The points must be a whole number greater than 0!');
    return;
  }

  // Subscribe new dank time for the chat.
  newDankTime(split[1], hour, minute, points, chat);
  bot.sendMessage(msg.chat.id, 'Added the new time!');
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
    bot.sendMessage(msg.chat.id, 'Not enough arguments! Format: /remove_time [text]');
    return;
  }

  // Remove the time from the chat.
  chat.dankTimes.delete(split[1]);
  bot.sendMessage(msg.chat.id, 'Removed the time!');
}

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
 * - dankTimes: The dank times known in this chat.
 * @param {number} id The chat's unique Telegram id.
 * @return {Chat} New chat.
 */
function newChat(id) {
  const chat = {id: id, users: new Map(), lastTime: undefined, running: false, dankTimes: new Map()};
  newDankTime('1337', 13, 37, 5, chat);
  newDankTime('420', 16, 20, 5, chat);
  chats.set(id, chat);
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
  commands.set(name, command);
  bot.onText(command.regex, command._function);
  return command;
}

// Exports for unit testing.
module.exports.newUser = newUser;
module.exports.newChat = newChat;
module.exports.newDankTime = newDankTime;
