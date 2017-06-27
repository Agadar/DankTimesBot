'use strict';

// Imports
const CHAT_REGISTRY = require('./chat-registry.js');
const TG_CLIENT = require('./telegram-client.js');
const util = require('./util.js');
const DankTime = require('./dank-time.js');

// Globals
const VERSION = '1.1.0';

/**
 * Starts the specified chat so that it records dank time texts.
 * Only prints a warning if the chat is already running.
 * @param {any} msg The message object from the Telegram api.
 * @param {any[]} match The regex matched object from the Telegram api.
 * @returns {string} The response.
 */
function startChat(msg, match) {
  const chat = CHAT_REGISTRY.getOrCreateChat(msg.chat.id);
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
  const chat = CHAT_REGISTRY.getOrCreateChat(msg.chat.id);
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
  const chat = CHAT_REGISTRY.getOrCreateChat(msg.chat.id);

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
  for (const user of CHAT_REGISTRY.getOrCreateChat(msg.chat.id).getUsers()) {
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
    CHAT_REGISTRY.getOrCreateChat(msg.chat.id).addDankTime(dankTime);
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
  if (CHAT_REGISTRY.getOrCreateChat(msg.chat.id).removeDankTime(hour, minute)) {
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
    CHAT_REGISTRY.getOrCreateChat(msg.chat.id).setTimezone(split[1]);
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
    CHAT_REGISTRY.getOrCreateChat(msg.chat.id).setNumberOfRandomTimes(Number(split[1]));
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
    CHAT_REGISTRY.getOrCreateChat(msg.chat.id).setPointsPerRandomTime(Number(split[1]));
    return 'Updated the points for random daily dank times!';
  } catch (err) {
    return err.message;
  }
}

// Exports.
module.exports.startChat = startChat;
module.exports.resetChat = resetChat;
module.exports.chatSettings = chatSettings;
module.exports.leaderBoard = leaderBoard;
module.exports.help = help;
module.exports.addTime = addTime;
module.exports.removeTime = removeTime;
module.exports.setTimezone = setTimezone;
module.exports.setDailyRandomTimes = setDailyRandomTimes;
module.exports.setDailyRandomTimesPoints = setDailyRandomTimesPoints;