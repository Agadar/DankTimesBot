"use strict";

const TelegramBot = require('node-telegram-bot-api');
const token = 'API_KEY_HERE';
const bot = new TelegramBot(token, {polling: true});
const dankTimes = new Map();  // Registered dank times.
const chats = new Map(); // All the scores of all the chats.

// Default values for dankTimes.
dankTimes.set('1337', newDankTime('1337', 13, 37));
dankTimes.set('1234', newDankTime('1234', 12, 34));
dankTimes.set('420', newDankTime('420', 16, 20));
dankTimes.set('1111', newDankTime('1111', 11, 11));
dankTimes.set('2222', newDankTime('2222', 22, 22));
dankTimes.set('1', newDankTime('1', 21, 16))

/** '/times' command. Prints the registered dank times. */
bot.onText(/^\/times$/, (msg, match) => {
  let times = 'Dank times:';
  for (const time of dankTimes) {
    times += "\n" + time[0] + " - " + time[1].hour + ":" + time[1].minute + ":00";
  }
  bot.sendMessage(msg.chat.id, times);
});

/** '/leaderboard' command. Prints the leaderboard. */
bot.onText(/^\/leaderboard$/, (msg, match) => {

  // Get the chat, creating it if needed.
  if (!chats.has(msg.chat.id)) {
    chats.set(msg.chat.id, newChat(msg.chat.id));
  }

  // Build a string to send from the chat's user list.
  let leaderboard = 'Leaderboard:';
  for (const user of chats.get(msg.chat.id).users) {
    leaderboard += "\n" + user[1].name + ": " + user[1].score;
  }
  bot.sendMessage(msg.chat.id, leaderboard);
});

/** Activated on any message. Checks for dank times. */
bot.on('message', (msg) => {

  // If the dank time don't exist, give up.
  if (!dankTimes.has(msg.text)) { 
    return;
  }

  // Get the chat, creating it if needed.
  if (!chats.has(msg.chat.id)) {
    chats.set(msg.chat.id, newChat(msg.chat.id));
  }
  const chat = chats.get(msg.chat.id);

  // Get the user from the chat, creating it if needed.
  if (!chat.users.has(msg.from.id)) {
    chat.users.set(msg.from.id, newUser(msg.from.id, msg.from.username));
  }
  const user = chat.users.get(msg.from.id);
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
});

/**
 * Creates a new user object. It has the following fields:
 * - id: The user's unique Telegram id;
 * - name: The user's Telegram name;
 * - score: The user's score, starting at 0;
 * - called: Whether the user already called the current dank time.
 * @param {number} id The user's unique Telegram id.
 * @param {string} name The user's Telegram name.
 */
function newUser(id, name) {
  return {id: id, name: name, score: 0, called: false};
}

/**
 * Creates a new chat object. It has the following fields:
 * - id: The chat's unique Telegram id;
 * - users: A map with the users, indexed by user id's;
 * - lastTime: The current dank time being shouted out.
 * @param {number} id The chat's unique Telegram id.
 */
function newChat(id) {
  return {id: id, users: new Map(), lastTime: undefined};
}

/**
 * Creates a new dank time object. It has the following fields:
 * - shoutout: The string to shout to get the point;
 * - hour: The hour to shout at;
 * - minute: The minute to shout at.
 * @param {string} shoutout The string to shout to get the point.
 * @param {number} hour The hour to shout at.
 * @param {number} minute The minute to shout at.
 */
function newDankTime(shoutout, hour, minute) {
  return {shoutout: shoutout, hour: hour, minute: minute};
}

module.exports.newUser = newUser;
module.exports.newChat = newChat;
module.exports.newDankTime = newDankTime;
