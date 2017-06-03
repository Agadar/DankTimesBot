'use strict';

const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, {polling: true});
const dankTimes = new Map();  // Registered dank times.
const chats = new Map(); // All the scores of all the chats.

// Default values for dankTimes.
newDankTime('1337', 13, 37);
newDankTime('1234', 12, 34);
newDankTime('420', 16, 20);
newDankTime('1111', 11, 11);
newDankTime('2222', 22, 22);

/**
 * Starts the DankTimesBot in the calling chat. Only usable for admins.
 */
bot.onText(/^\/start$/, (msg, match) => {

  // Get the chat, creating it if needed. Only continue if it is in running mode.
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);

  // Only groups have admins, so if this chat isn't a group, continue straight to callback.
  if (msg.chat.type !== 'group') {
    handleStartCallback(chat);
    return;
  }

  // Else if this chat is a group, then we must make sure the user is an admin.
  const promise = bot.getChatAdministrators(msg.chat.id);  
  promise.then(admins => {

    // Check to ensure user is admin. If not, post message.
    for (const admin of admins) {
      if (admin.user.id === msg.from.id) {
        handleStartCallback(chat);
        return;
      }
    }
    bot.sendMessage(msg.chat.id, 'This option is only available to admins.');
  }).catch(reason => {
    console.info('Failed to retrieve admin list.\n' + reason);
    bot.sendMessage('Failed to retrieve admin list. See server console.');
  });

});

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
  const chat = chats.has(msg.chat.id) ? chats.get(msg.chat.id) : newChat(msg.chat.id);

  // Build a string to send from the chat's user list.
  let leaderboard = 'Leaderboard:';
  for (const user of chat.users) {
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
 * Starts the specified chat so that it records dank time shoutouts.
 * Only prints a warning if the chat is already running.
 * @param {chat} chat The chat to start.
 */
function handleStartCallback(chat) {
  if (chat.running) {
    bot.sendMessage(chat.id, 'DankTimesBot is already running!');
  } else {
    chat.running = true;
    bot.sendMessage(chat.id, 'DankTimesBot is now running!');
  }
}

/**
 * Debugging function for checking 'chats' contents.
 */
function printChats() {
  let log = '---- DEBUG INFO ---\n\n';
  for (const chat of chats) {
    log += '- chat id: ' + chat[1].id + '\n';
    log += '  lastTime: ' + chat[1].lastTime + '\n';
    for (const user of chat[1].users) {
      log += '\t- user id: ' + user[1].id + '\n';
      log += '\t  name: ' + user[1].name + '\n';
      log += '\t  score: ' + user[1].score + '\n';
      log += '\t  called: ' + user[1].called + '\n';
    }
  }
  console.info(log);
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
 * @param {chat} chat The chat to which the user belongs.
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
 */
function newDankTime(shoutout, hour, minute) {
  const dankTime = {shoutout: shoutout, hour: hour, minute: minute};
  dankTimes.set(shoutout, dankTime);
  return dankTime;
}
