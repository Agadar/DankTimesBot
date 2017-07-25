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
   */
  constructor(tgClient) {
    this._tgClient = tgClient;
    this._randomDankTimeNotifications = [];
    this._dankTimeNotifications = [];
    this._autoLeaderBoards = [];
  };

  /**
   * Schedules all normal and random dank times notifications and auto-leaderboards of a chat.
   * @param {Chat} chat 
   */
  scheduleAllOfChat(chat) {

    // If the chat ain't running, schedule nothing.
    if (!chat.isRunning()) {
      return;
    }

    // Schedule RANDOM dank time notifications.
    this.scheduleRandomDankTimesOfChat(chat);

    // Schedule NORMAL dank time notifications, if desired.
    if (chat.getNotifications()) {
      this.scheduleDankTimesOfChat(chat);
    }

    // Schedule auto-leaderboards, if desired.
    if (chat.getAutoLeaderboards()) {
      this.scheduleAutoLeaderboardsOfChat(chat);
    }
  };

  /**
   * Schedules all NORMAL dank time notifications of a chat. Does NOT verify chat settings.
   * @param {Chat} chat 
   */
  scheduleDankTimesOfChat(chat) {
    chat.getDankTimes().forEach(dankTime => {
      this.scheduleDankTime(chat, dankTime);
    });
  }

  /**
   * Schedules all RANDOM dank time notifications of a chat. Does NOT verify chat settings.
   * @param {Chat} chat 
   */
  scheduleRandomDankTimesOfChat(chat) {
    chat.getRandomDankTimes().forEach(dankTime => {
      this.scheduleRandomDankTime(chat, dankTime);
    });
  }

  /**
   * Schedules all auto-leaderboard posts of a chat. Does NOT verify chat settings.
   * @param {Chat} chat 
   */
  scheduleAutoLeaderboardsOfChat(chat) {
    chat.getRandomDankTimes().forEach(dankTime => {
      this.scheduleAutoLeaderboard(chat, dankTime);
    });

    chat.getDankTimes().forEach(dankTime => {
      this.scheduleAutoLeaderboard(chat, dankTime);
    });
  }

  /**
   * Unschedules all normal and random dank time notifications and auto-leaderboards of a chat.
   * @param {Chat} chat 
   */
  unscheduleAllOfChat(chat) {
    this.unscheduleDankTimesOfChat(chat);
    this.unscheduleRandomDankTimesOfChat(chat);
    this.unscheduleAutoLeaderboardsOfChat(chat);
  };

  /**
   * Unschedules all NORMAL dank time notifications of a chat.
   * @param {Chat} chat 
   */
  unscheduleDankTimesOfChat(chat) {
    this._unscheduleCronJobsOfChat(chat, this._dankTimeNotifications);
  }

  /**
   * Unschedules all RANDOM dank time notifications of a chat.
   * @param {Chat} chat 
   */
  unscheduleRandomDankTimesOfChat(chat) {
    this._unscheduleCronJobsOfChat(chat, this._randomDankTimeNotifications);
  }

  /**
   * Unschedules all auto-leaderboard posts of a chat.
   * @param {Chat} chat 
   */
  unscheduleAutoLeaderboardsOfChat(chat) {
    this._unscheduleCronJobsOfChat(chat, this._autoLeaderBoards);
  }

  /**
   * Unschedules all cron jobs in the supplied array belonging to the specified chat.
   * @param {Chat} chat 
   * @param {any[]} cronJobs 
   */
  _unscheduleCronJobsOfChat(chat, cronJobs) {
    let i = cronJobs.length;
    while (i--) {
      const job = cronJobs[i];
      if (job.chatId === chat.getId()) {
        job.cronJob.stop();
        cronJobs.splice(i, 1);
      }
    }
  }

  /**
   * Resets this scheduler completely, unscheduling all jobs and emptying the job lists.
   */
  reset() {
    this._dankTimeNotifications.forEach(job => job.cronJob.stop());
    this._dankTimeNotifications = [];
    this._autoLeaderBoards.forEach(job => job.cronJob.stop());
    this._autoLeaderBoards = [];
    this._randomDankTimeNotifications.forEach(job => job.cronJob.stop());
    this._randomDankTimeNotifications = [];
  };

  /**
   * Unschedules a NORMAL dank time notification.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  unscheduleDankTime(chat, dankTime) {
    this._unscheduleCronJob(chat, dankTime, this._dankTimeNotifications);
  };

  /**
   * Unschedules a RANDOM dank time notification.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  unscheduleRandomDankTime(chat, dankTime) {
    this._unscheduleCronJob(chat, dankTime, this._randomDankTimeNotifications);
  };

  /**
   * Unschedules a the auto-posting of a leaderboard 1 minute after a dank time. 
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  unscheduleAutoLeaderboard(chat, dankTime) {
    this._unscheduleCronJob(chat, dankTime, this._autoLeaderBoards);
  };

  /**
   * Unschedules and removes the cronjob from the supplied array that belongs to the specified Chat and DankTime.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   * @param {any[]} cronJobs 
   */
  _unscheduleCronJob(chat, dankTime, cronJobs) {
    let i = cronJobs.length;

    while (i--) {
      const job = cronJobs[i];
      if (job.chatId === chat.getId() && job.hour === dankTime.getHour() && job.minute === dankTime.getMinute()) {
        job.cronJob.stop();
        cronJobs.splice(i, 1);
        return;
      }
    }
  }

  /**
   * Schedules a notification for a NORMAL dank time. Does NOT verify chat settings.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  scheduleDankTime(chat, dankTime) {
    const _this = this;
    this._dankTimeNotifications.push({
      chatId: chat.getId(), hour: dankTime.getHour(), minute: dankTime.getMinute(), cronJob: new cron.CronJob('0 ' + dankTime.getMinute() + ' ' + dankTime.getHour() + ' * * *', function () {
        if (chat.isRunning() && chat.getNotifications()) {
          _this._tgClient.sendMessage(chat.getId(), 'It\'s dank o\'clock! Type \'' + dankTime.getTexts()[0] + '\' for points!');
        }
      }, null, true, chat.getTimezone())
    });
  }

  /**
   * Schedules a notification for a RANDOM dank time. Does NOT verify chat settings.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  scheduleRandomDankTime(chat, dankTime) {
    const _this = this;
    this._randomDankTimeNotifications.push({
      chatId: chat.getId(), hour: dankTime.getHour(), minute: dankTime.getMinute(), cronJob: new cron.CronJob('0 ' + dankTime.getMinute() + ' ' + dankTime.getHour() + ' * * *', function () {
        if (chat.isRunning()) {
          _this._tgClient.sendMessage(chat.getId(), 'Surprise dank time! Type \'' + dankTime.getTexts()[0] + '\' for points!');
        }
      }, null, true, chat.getTimezone())
    });
  }

  /**
   * Schedules the auto-posting of a leaderboard 1 minute after a dank time. Does NOT verify chat settings.
   * @param {Chat} chat 
   * @param {DankTime} dankTime 
   */
  scheduleAutoLeaderboard(chat, dankTime) {
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

    // Schedule the cron job.
    const _this = this;
    this._autoLeaderBoards.push({
      chatId: chat.getId(), hour: dankTime.getHour(), minute: dankTime.getMinute(), cronJob: new cron.CronJob('0 ' + minute + ' ' + hour + ' * * *', function () {
        if (chat.isRunning() && chat.getAutoLeaderboards() && chat.leaderboardChanged()) {
          _this._tgClient.sendMessage(chat.getId(), chat.generateLeaderboard());
        }
      }, null, true, chat.getTimezone())
    });
  }
}

// Exports.
module.exports = DankTimeScheduler;
