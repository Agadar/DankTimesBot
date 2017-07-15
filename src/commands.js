'use strict';

// Imports
const ChatRegistry = require('./chat-registry.js');
const TelegramClient = require('./telegram-client.js');
const util = require('./util.js');
const DankTime = require('./dank-time.js');

/** Holds functions that take a 'msg' and a 'match' parameter, and return string messages. */
class Commands {

  /**
   * Instantiates a new Commands object.
   * @param {TelegramClient} tgClient 
   * @param {ChatRegistry} chatRegistry
   * @param {DankTimeScheduler} scheduler
   * @param {Release[]} releaseLog
   * @param {string} version 
   */
  constructor(tgClient, chatRegistry, scheduler, releaseLog, version) {
    this._tgClient = tgClient;
    this._chatRegistry = chatRegistry;
    this._scheduler = scheduler;
    this._releaseLog = releaseLog;
    this._version = version;
  }

  /**
   * Starts the specified chat so that it records dank time texts.
   * Only prints a warning if the chat is already running.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api.
   * @returns {string} The response.
   */
  startChat(msg, match) {
    const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
    if (chat.isRunning()) {
      return 'The bot is already running!';
    }
    chat.setRunning(true);
    this._scheduler.scheduleAllOfChat(chat);
    return 'The bot is now running! Hit \'/help\' for available commands.';
  }

  /**
   * Stops the specified chat so that it stops recording dank time texts.
   * Only prints a warning if the chat isn't already stopped.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api.
   * @returns {string} The response.
   */
  stopChat(msg, match) {
    const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
    if (chat.isRunning()) {
      chat.setRunning(false);
      this._scheduler.unscheduleAllOfChat(chat);
      return 'The bot is now stopped! Hit \'/start\' to restart.';
    }
    return 'The bot is already stopped!';
  }

  /**
   * Resets the scores of the specified chat.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  resetChat(msg, match) {
    this._chatRegistry.getOrCreateChat(msg.chat.id).setAwaitingResetConfirmation(msg.from.id);
    return 'Are you sure? Type \'yes\' to confirm.';
  }

  /**
   * Prints the current settings of the chat identified in the msg object.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  chatSettings(msg, match) {
    const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);

    let settings = '<b>--- SETTINGS ---</b>\n';
    settings += '\n<b>Auto-post leaderboards:</b> ' + (chat.getAutoLeaderboards() ? 'on' : 'off');
    settings += '\n<b>Chat time zone:</b> ' + chat.getTimezone() + '\n<b>Dank times:</b>';
    for (const time of chat.getDankTimes()) {
      settings += "\ntime: " + util.padNumber(time.getHour()) + ":" + util.padNumber(time.getMinute()) + ":00    points: " + time.getPoints() + "    texts:";
      for (let text of time.getTexts()) {
        settings += " " + text;
      }
    }
    settings += '\n<b>Dank time notifications:</b> ' + (chat.getNotifications() ? 'on' : 'off');
    settings += '\n<b>Multiplier:</b> x' + chat.getMultiplier();
    settings += '\n<b>Random dank times per day:</b> ' + chat.getNumberOfRandomTimes();
    settings += '\n<b>Random dank time points:</b> ' + chat.getPointsPerRandomTime();
    settings += '\n<b>Server time:</b> ' + new Date();
    settings += '\n<b>Status:</b> ' + (chat.isRunning() ? 'running' : 'awaiting start');
    settings += '\n<b>Version:</b> ' + this._version;
    return settings;
  }

  /**
   * Prints the leaderboard of the chat identified in the msg object.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  leaderBoard(msg, match) {
    return this._chatRegistry.getOrCreateChat(msg.chat.id).generateLeaderboard();
  }

  /**
   * Prints the available commands to the chat identified in the msg object.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  help(msg, match) {
    let help = '<b>--- AVAILABLE COMMANDS ---</b>\n';
    this._tgClient.getCommands().forEach(command => help += '\n/' + command.getName() + ' - ' + command.getDescription());
    return help;
  }

  /**
   * Adds a new dank time to the chat.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  addTime(msg, match) {

    // Split string and ensure it contains at least 4 items.
    const split = match.input.split(' ');
    if (split.length < 5) {
      return 'Not enough arguments! Format: /addtime [hour] [minute] [points] [text1] [text2] etc.';
    }

    // Identify arguments.
    const hour = Number(split[1]);
    const minute = Number(split[2]);
    const points = Number(split[3]);
    const texts = split.splice(4);

    // Subscribe new dank time for the chat, replacing any with the same hour and minute.
    try {
      const dankTime = new DankTime(hour, minute, texts, points);
      const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
      chat.addDankTime(dankTime);

      // Reschedule notifications just to make sure, if applicable.
      if (chat.isRunning()) {
        if (chat.getNotifications()) {
          this._scheduler.unscheduleDankTime(chat, dankTime);
          this._scheduler.scheduleDankTime(chat, dankTime);
        }
        if (chat.getAutoLeaderboards()) {
          this._scheduler.unscheduleAutoLeaderboard(chat, dankTime);
          this._scheduler.scheduleAutoLeaderboard(chat, dankTime);
        }
      }
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
  removeTime(msg, match) {

    // Split string and ensure it contains at least 2 items.
    const split = match.input.split(' ');
    if (split.length < 3) {
      return 'Not enough arguments! Format: /removetime [hour] [minute]';
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
    const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
    const dankTime = chat.getDankTime(hour, minute);

    if (chat.removeDankTime(hour, minute)) {
      this._scheduler.unscheduleDankTime(chat, dankTime);
      this._scheduler.unscheduleAutoLeaderboard(chat, dankTime);
      return 'Removed the time!'
    } else {
      return 'No dank time known with that hour and minute!';
    }
  }

  /**
   * Updates the chat's time zone.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  setTimezone(msg, match) {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(' ');
    if (split.length < 2) {
      return 'Not enough arguments! Format: /settimezone [timezone]';
    }

    // Update the time zone.
    try {
      const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
      chat.setTimezone(split[1]);

      // Reschedule due to timezone change.
      this._scheduler.unscheduleAllOfChat(chat);
      this._scheduler.scheduleAllOfChat(chat);
      return 'Updated the time zone!';
    } catch (err) {
      return err.message;
    }
  }

  /**
   * Updates the chat's first score multiplier.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  setMultiplier(msg, match) {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(' ');
    if (split.length < 2) {
      return 'Not enough arguments! Format: /setmultiplier [number]';
    }

    // Update the time zone.
    try {
      this._chatRegistry.getOrCreateChat(msg.chat.id).setMultiplier(Number(split[1]));
      return 'Updated the multiplier!';
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
  setDailyRandomTimes(msg, match) {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(' ');
    if (split.length < 2) {
      return 'Not enough arguments! Format: /setdailyrandomfrequency [number]';
    }

    // Do the update.
    try {
      const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
      chat.setNumberOfRandomTimes(Number(split[1]));

      // Reschedule due to removed random times.
      if (chat.isRunning()) {
        this._scheduler.unscheduleRandomDankTimesOfChat(chat);
        this._scheduler.scheduleRandomDankTimesOfChat(chat);

        if (chat.getAutoLeaderboards()) {
          this._scheduler.unscheduleAutoLeaderboardsOfChat(chat);
          this._scheduler.scheduleAutoLeaderboardsOfChat(chat);
        }
      }
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
  setDailyRandomTimesPoints(msg, match) {

    // Split string and ensure it contains at least 1 item.
    const split = match.input.split(' ');
    if (split.length < 2) {
      return 'Not enough arguments! Format: /setdailyrandompoints [number]';
    }

    try {
      this._chatRegistry.getOrCreateChat(msg.chat.id).setPointsPerRandomTime(Number(split[1]));
      return 'Updated the points for random daily dank times!';
    } catch (err) {
      return err.message;
    }
  }

  /**
   * Toggles whether the chat auto-posts notifications about NORMAL dank times.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  toggleNotifications(msg, match) {
    const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
    chat.setNotifications(!chat.getNotifications());

    if (chat.getNotifications()) {
      if (chat.isRunning()) {
        this._scheduler.scheduleDankTimesOfChat(chat);
      }
      return 'Normal dank time notifications are now enabled!';
    } else {
      if (chat.isRunning()) {
        this._scheduler.unscheduleDankTimesOfChat(chat);
      }
      return 'Normal dank time notifications are now disabled! (Random dank time notifications remain enabled.)';
    }
  }

  /**
   * Toggles whether the chat auto-posts a leaderboard 1 minute after every dank time.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  toggleAutoLeaderboards(msg, match) {
    const chat = this._chatRegistry.getOrCreateChat(msg.chat.id);
    chat.toggleAutoLeaderboards();

    if (chat.getAutoLeaderboards()) {
      if (chat.isRunning()) {
        this._scheduler.scheduleAutoLeaderboardsOfChat(chat);
      }
      return 'Automatic leaderboard posting is now enabled!';
    } else {
      if (chat.isRunning()) {
        this._scheduler.unscheduleAutoLeaderboardsOfChat(chat);
      }
      return 'Automatic leaderboard posting is now disabled!';
    }
  }

  /** 
   * Gets the entire release log, formatted neatly.
   * @param {any} msg The message object from the Telegram api.
   * @param {any[]} match The regex matched object from the Telegram api. 
   * @returns {string} The response.
   */
  releaseLog(msg, match) {
    let reply = '<b>--- RELEASES ---</b>\n';
    this._releaseLog.forEach(release => {
      reply += '\n';
      reply += '<b>Version:</b> ' + release.version + '\n';
      reply += '<b>Date:</b> ' + release.date + '\n';
      reply += '<b>Changes:</b>\n';
      release.changes.forEach(change => {
        reply += '- ' + change + '\n';
      });
    });
    return reply;
  }
}

// Exports.
module.exports = Commands;