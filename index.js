'use strict';

const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, {polling: true});
const dankTimes = new Map();  // Registered dank times.
const chats = new Map(); // All the scores of all the chats.
const commands = new Map(); // All the available settings of this bot.

// Default values for dankTimes.
newDankTime('1337', 13, 37);
newDankTime('1234', 12, 34);
newDankTime('420', 16, 20);
newDankTime('1111', 11, 11);
newDankTime('2222', 22, 22);

// Available commands.
newCommand('/start', 'Starts keeping track of scores', (msg) => callFunctionIfUserIsAdmin(msg, startChat));
newCommand('/reset', 'Resets the scores', (msg) => callFunctionIfUserIsAdmin(msg, resetChat));
newCommand('/settings', 'Shows the current settings', (msg) => chatSettings(msg));
newCommand('/leaderboard', 'Shows the leaderboard', (msg) => leaderBoard(msg));
newCommand('/help', 'Shows the available commands', (msg) => help(msg));

/** Activated on any message. Checks for dank times. */
bot.on('message', (msg) => {

  // If the dank time don't exist, give up.
  if (!dankTimes.has(msg.text)) { 
    return;
  }

  // Get the chat, creating it if needed. If it is not running, then abort.
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);
  if (chat.running) {

    // Get user, shouted dank time, and server time.
    const user = chat.users.has(msg.from.id) ? chat.users.get(msg.from.id) : newUser(msg.from.id, msg.from.username, chat);
    const dankTime = dankTimes.get(msg.text);
    const serverDate = new Date();
    
    // If the times match...
    if (serverDate.getHours() === dankTime.hour && (serverDate.getMinutes() === dankTime.minute 
      || new Date(msg.date * 1000).getMinutes() === dankTime.minute)) {
      
      if (chat.lastTime !== dankTime.shoutout) {  // If cache needs resetting, do so and award point.
        for (const chatUser of chat.users) {
          chatUser[1].called = false;
        }
        chat.lastTime = dankTime.shoutout;
        user.score++;
        user.called = true;
      } else if (user.called) { // Else if user already called this time, remove point.
        user.score--;
      } else {  // Else, award point.
        user.score++;
        user.called = true;
      }
    } else {
      user.score--;
    }
  }
});

/**
 * Calls the specified function, but only if the calling user is
 * an admin in his chat, or it is a private chat.
 * @param {any} msg The message object from the Telegram api.
 * @param {function} callMe The function to call, expected to have a single 'chat' parameter.
 */
function callFunctionIfUserIsAdmin(msg, callMe) {

  // Get the right chat.
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);

  // Only groups have admins, so if this chat isn't a group, continue straight to callback.
  if (msg.chat.type !== 'group') {
    callMe(chat);
    return;
  }

  // Else if this chat is a group, then we must make sure the user is an admin.
  const promise = bot.getChatAdministrators(chat.id);  
  promise.then(admins => {

    // Check to ensure user is admin. If not, post message.
    for (const admin of admins) {
      if (admin.user.id === msg.from.id) {
        callMe(chat);
        return;
      }
    }
    bot.sendMessage(chat.id, 'This option is only available to admins.');
  }).catch(reason => {
    console.info('Failed to retrieve admin list.\n' + reason);
    bot.sendMessage('Failed to retrieve admin list. See server console.');
  });
}

/**
 * Starts the specified chat so that it records dank time shoutouts.
 * Only prints a warning if the chat is already running.
 * @param {Chat} chat The chat to start.
 */
function startChat(chat) {
  if (chat.running) {
    bot.sendMessage(chat.id, 'DankTimesBot is already running!');
  } else {
    chat.running = true;
    bot.sendMessage(chat.id, 'DankTimesBot is now running! Hit \'/help\' for available commands.');
  }
}

/**
 * Resets the scores of the specified chat.
 * @param {Chat} chat The chat to reset. 
 */
function resetChat(chat) {
  for (const user of chat.users) {
    user[1].score = 0;
    user[1].called = false;
  }
  bot.sendMessage(chat.id, 'Leaderboard has been reset!');
}

/**
 * Prints the current settings of the chat identified in the msg object.
 * @param {any} msg The message object from the Telegram api.
 */
function chatSettings(msg) {
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);
  let settings = 'Status:    ' + (chat.running ? 'running' : 'not running');
  settings += ';\nDank times:';
  for (const time of dankTimes) {
    settings += "\n    time: " + time[1].hour + ":" + time[1].minute + ";    magical word: " + time[0] + ";";
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
  let leaderboard = 'Leaderboard:';
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
 * Creates a new chat object and places it in 'chats'. 
 * It has the following fields:
 * - id: The chat's unique Telegram id;
 * - users: A map with the users, indexed by user id's;
 * - lastTime: The current dank time being shouted out;
 * - running: Whether this bot is running for this chat.
 * @param {number} id The chat's unique Telegram id.
 * @return {Chat} New chat.
 */
function newChat(id) {
  const chat = {id: id, users: new Map(), lastTime: undefined, running: false};
  chats.set(id, chat);
  return chat;
}

/**
 * Creates a new dank time object and places it in 'dankTimes'.
 * It has the following fields:
 * - shoutout: The string to shout to get the point;
 * - hour: The hour to shout at;
 * - minute: The minute to shout at.
 * @param {string} shoutout The string to shout to get the point.
 * @param {number} hour The hour to shout at.
 * @param {number} minute The minute to shout at.
 * @return {DankTime} New dank time.
 */
function newDankTime(shoutout, hour, minute) {
  const dankTime = {shoutout: shoutout, hour: hour, minute: minute};
  dankTimes.set(shoutout, dankTime);
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

module.exports.newUser = newUser;
module.exports.newChat = newChat;
module.exports.newDankTime = newDankTime;
