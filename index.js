"use strict";

const TelegramBot = require('node-telegram-bot-api');
const token = 'INSERT-TOKEN-HERE';
const bot = new TelegramBot(token, {polling: true});
const dankTimes = new Map();  // Registered dank times.
const scores = new Map(); // All the scores of all the chats.

// Default values for dankTimes.
dankTimes.set('1337', {hour: 13, minute: 37});
dankTimes.set('1234', {hour: 12, minute: 34});
dankTimes.set('420', {hour: 16, minute: 20});
dankTimes.set('1111', {hour: 11, minute: 11});
dankTimes.set('2222', {hour: 22, minute: 22});

/** '/times' command. Prints the registered dank times. */
bot.onText(/^\/times$/, (msg, match) => {
  let times = 'Dank times:';

  for (const time of dankTimes) {
    times += "\n" + time[0] + " - " + time[1].hour + ":" + time[1].minute + ":xx";
  }
  bot.sendMessage(msg.chat.id, times);
});

/** '/leaderboard' command. Prints the leaderboard. */
bot.onText(/^\/leaderboard$/, (msg, match) => {
  if (!scores.has(msg.chat.id)) {
    scores.set(msg.chat.id, new Map());
  }
  let leaderboard = 'Leaderboard:';

  for (const user of scores.get(msg.chat.id)) {
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

  // Get the chat's scores, creating it if needed.
  if (!scores.has(msg.chat.id)) {
    scores.set(msg.chat.id, new Map());
  }
  const chatScores = scores.get(msg.chat.id);

  // Get the user's score from the chat scores, creating it if needed.
  if (!chatScores.has(msg.from.id)) {
    chatScores.set(msg.from.id, {name: msg.from.username, score: 0});
  }
  const playerScore = chatScores.get(msg.from.id);
  const dankTime = dankTimes.get(msg.text);
  const serverDate = new Date();
  
  // If the times match, add a point to the user's score. Else, subtract one.
  if (serverDate.getHours() === dankTime.hour && (serverDate.getMinutes() === dankTime.minute || new Date(msg.date * 1000).getMinutes() === dankTime.minute)) {
    playerScore.score++;
  } else {
    playerScore.score--;
  }
});
