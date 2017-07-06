'use strict';

// Imports
const cron = require('cron'); // NodeJS library for scheduling cron jobs.

/** 
 * Responsible for scheduling notification messages about dank times. 
 */
class DankTimeScheduler {

  /**
   * Initializes a new dank time scheduler.
   * @param {TelegramClient} tgClient 
   * @param {boolean} showLeaderboardAfter 
   */
  constructor(tgClient, showLeaderboardAfter) {
    this._tgClient = tgClient;
    this._showLeaderboardAfter = showLeaderboardAfter;
    this._jobs = [];
  };

  /**
   * Schedules all dank times of a chat.
   * @param {Chat} chat 
   */
  scheduleAllOfChat(chat) {
    chat.getRandomDankTimes().forEach(dankTime => {
      this.schedule(chat, dankTime, 'Surprise dank time! Type \'' + dankTime.getTexts()[0] + '\' for points!');
    });
    chat.getDankTimes().forEach(dankTime => {
      this.schedule(chat, dankTime, 'It\'s dank o\'clock! Type \'' + dankTime.getTexts()[0] + '\' for points!');
    });
  };

  /**
   * Unschedules all dank times of a chat.
   * @param {Chat} chat 
   */
  unscheduleAllOfChat(chat) {
    let i = this._jobs.length;
    while (i--) {
      if (this._jobs[i].chatId === chat.getId()) {
        this._jobs[i].cronJob.stop();
        this._jobs.splice(i, 1);
      }
    }
  };

  /**
   * Resets this scheduler, unscheduling all jobs and emptying the job list.
   */
  reset() {
    this._jobs.forEach(job => job.cronJob.stop());
    this._jobs = [];
  };

  /**
   * Unschedules a dank time (and its corresponding leaderboard, if applicable).
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  unschedule(chat, dankTime) {
    let i = this._jobs.length;
    let remaining = this._showLeaderboardAfter ? 2 : 1;

    while (i--) {
      if (this._jobs[i].chatId === chat.getId() && this._jobs[i].hour === dankTime.getHour() && this._jobs[i].minute === dankTime.getMinute()) {
        this._jobs[i].cronJob.stop();
        this._jobs.splice(i, 1);
        remaining--;

        if (remaining <= 0) {
          return;
        }
      }
    }
  };

  /**
   * Schedules a single dank time.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   * @param {string} text 
   */
  schedule(chat, dankTime, text) {
    const _this = this;
    this._jobs.push({
      chatId: chat.getId(), hour: dankTime.getHour(), minute: dankTime.getMinute(), cronJob: new cron.CronJob('0 ' + dankTime.getMinute() + ' ' + dankTime.getHour() + ' * * *', function () {
        if (chat.isRunning()) {
          _this._tgClient.sendMessage(chat.getId(), text);
        }
      }, null, true, chat.getTimezone())
    });

    // Schedule the showing of the leaderboard if so desired.
    if (this._showLeaderboardAfter) {
      let minute = dankTime.getMinute() + 1;
      let hour = dankTime.getHour();

      // Correct if minute + 1 is 60.
      if (minute >= 60) {
        minute = 0;
        hour++;

        // Correct if hour is 24.
        if (hour >= 24) {
          hour = 0;
        }
      }

      // Schedule the job.
      this._jobs.push({
        chatId: chat.getId(), hour: dankTime.getHour(), minute: dankTime.getMinute(), cronJob: new cron.CronJob('0 ' + minute + ' ' + hour + ' * * *', function () {
          if (chat.isRunning()) {
            _this._tgClient.sendMessage(chat.getId(), chat.generateLeaderboard());
          }
        }, null, true, chat.getTimezone())
      });
    }
  };
}

// Exports.
module.exports = DankTimeScheduler;
