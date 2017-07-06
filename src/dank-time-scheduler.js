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
     * @param {Commands} commands 
     * @param {boolean} showLeaderboardAfter 
     */
    constructor(tgClient, commands, showLeaderboardAfter) {
        this._tgClient = tgClient;
        this._commands = commands;
        this._showLeaderboardAfter = showLeaderboardAfter;
        this._jobs = [];
    };

    /**
     * Schedules all dank times of a chat.
     * @param {Chat} chat 
     */
    scheduleDankTimes(chat) {
        chat.getRandomDankTimes().forEach(dankTime => {
            this._scheduleDankTime(chat, dankTime, 'Surprise dank time! Type \'' + dankTime.getTexts()[0] + '\' for points!');
        });
        chat.getDankTimes().forEach(dankTime => {
            this._scheduleDankTime(chat, dankTime, 'It\'s dank o\'clock! Type \'' + dankTime.getTexts()[0] + '\' for points!');
        });
    };

    /**
     * Resets this scheduler, unscheduling all jobs and emptying the job list.
     */
    reset() {
        this._jobs.forEach(job => job.stop());
        this._jobs = [];
    };

    /**
     * Schedules a single dank time.
     * @param {Chat} chat 
     * @param {DankTime} dankTime 
     * @param {string} text 
     */
    _scheduleDankTime(chat, dankTime, text) {
        this._jobs.push(new cron.CronJob('0 ' + dankTime.getMinute() + ' ' + dankTime.getHour() + ' * * *', function () {
            if (chat.isRunning()) {
                this._tgClient.sendMessage(chat.getId(), text);
            }
        }, null, true, chat.getTimezone()));

        if (this._showLeaderboardAfter) {
            // TODO: Below line needs check for if minute is 59 or if hour is 23 
            this._jobs.push(new cron.CronJob('0 ' + (dankTime.getMinute() + 1) + ' ' + dankTime.getHour() + ' * * *', function () {
                if (chat.isRunning()) {
                    this._tgClient.sendMessage(chat.getId(), this._commands.leaderBoard({ msg: { chat: { id: chat.getId() } } }));
                }
            }, null, true, chat.getTimezone()));
        }
    };

}

module.exports = DankTimeScheduler;
