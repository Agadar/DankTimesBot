import * as emojilib from "emojilib";
import TelegramBot from "node-telegram-bot-api";
import { AlterUserScoreArgs } from "../../chat/alter-user-score-args";
import { Chat } from "../../chat/chat";
import { CoreSettingsNames } from "../../chat/settings/core-settings-names";
import { User } from "../../chat/user/user";
import { IDankTimeScheduler } from "../../dank-time-scheduler/i-dank-time-scheduler";
import { DankTime } from "../../dank-time/dank-time";
import { Release } from "../../misc/release";
import { AbstractPlugin } from "../../plugin-host/plugin/plugin";
import { IUtil } from "../../util/i-util";
import { BotCommandConfirmationQuestion } from "../bot-command-confirmation-question";
import { BotCommandRegistry } from "../bot-command-registry";
import { IDankTimesBotCommands } from "./i-danktimesbot-commands";

/** Holds functions that take a 'msg' and a 'match' parameter, and return string messages. */
export class DankTimesBotCommands implements IDankTimesBotCommands {

    constructor(
        private readonly commandsRegistry: BotCommandRegistry,
        private readonly scheduler: IDankTimeScheduler,
        private readonly util: IUtil,
        private readonly releaseLog: Release[],
    ) { }

    public startChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (chat.running) {
            return "⚠️ The bot is already running!";
        }
        chat.running = true;
        this.scheduler.scheduleAllOfChat(chat);
        return "🏃 The bot is now running! Hit '/help' for available commands.";
    }

    public stopChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (chat.running) {
            chat.running = false;
            this.scheduler.unscheduleAllOfChat(chat);
            return "🛑 The bot is now stopped! Hit '/start' to restart.";
        }
        return "⚠️ The bot is already stopped!";
    }

    public resetChat(chat: Chat, user: User, msg: TelegramBot.Message, match: string): BotCommandConfirmationQuestion {
        const confirmationQuestion = new BotCommandConfirmationQuestion();
        confirmationQuestion.actionOnConfirm = () => {
            const finalLeaderboard = chat.generateLeaderboard(true);
            const outputText = "Leaderboard has been reset!\n\n" + finalLeaderboard;
            chat.resetScores();
            return outputText;
        };
        return confirmationQuestion;
    }

    public settings(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        return chat.getFormattedSettingsValues();
    }

    public settingshelp(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        return chat.getFormattedSettingsDescriptions();
    }

    public set(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {

        // Split string and ensure it contains at least 2 items.
        const split = match.split(" ");
        if (split.length < 2) {
            return "⚠️ Not enough arguments! Format: /set [name] [value]";
        }

        // Update the chat setting
        try {
            const settingname = split[0];
            const settingvalue = split[1];
            chat.setSetting(settingname, settingvalue);

            // Altering some settings has side-effects:
            if (settingname === CoreSettingsNames.timezone) {
                this.doTimezoneSettingSideEffects(chat);
            } else if (settingname === CoreSettingsNames.randomtimesFrequency) {
                this.doNumberOfRandomTimesSettingSideEffects(chat);
            } else if (settingname === CoreSettingsNames.normaltimesNotifications) {
                this.doNotificationsSettingSideEffects(chat);
            }

            return "🎉 Updated the setting!";
        } catch (err) {
            return "⚠️ " + err.message;
        }
    }

    public dankTimes(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        let dankTimes = "<b>⏰ DANK TIMES</b>\n";
        for (const time of chat.dankTimes) {
            dankTimes +=
                `\ntime: ${this.util.padNumber(time.hour)}:`
                + `${this.util.padNumber(time.minute)}:00    points: ${time.getPoints()}    texts: `;
            for (const text of time.texts) {
                dankTimes += `${text}, `;
            }
            dankTimes = dankTimes.slice(0, -2);
        }
        return dankTimes;
    }

    public leaderBoard(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        return chat.generateLeaderboard();
    }

    public help(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        const sortedCommands = this.commandsRegistry.getCommandsForHelpOutput();
        let help = "<b>ℹ️ AVAILABLE COMMANDS</b>\n";
        sortedCommands.forEach((command) => help += "\n/" + command.names[0] + " - " + command.description);
        return help;
    }

    public addTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (!match) {
            return "⚠️ Not enough arguments! Format: /addtime [hour] [minute] [points] [text1],[text2], etc.";
        }
        const commaSplit: string[] = match.split(",").filter((part: string) => !!part);
        const spaceSplit: string[] = commaSplit[0].split(" ").filter((part: string) => !!part);

        // Ensure it contains at least 4 items.
        if (spaceSplit.length < 4) {
            return "⚠️ Not enough arguments! Format: /addtime [hour] [minute] [points] [text1],[text2], etc.";
        }

        // Identify and verify arguments.
        const hour = Number(spaceSplit[0]);
        const minute = Number(spaceSplit[1]);
        const points = this.util.parseScoreInput(spaceSplit[2], undefined, undefined);

        if (isNaN(hour)) {
            return "⚠️ The hour must be a number!";
        }
        if (isNaN(minute)) {
            return "⚠️ The minute must be a number!";
        }
        if (points === null) {
            return "⚠️ The points must be a number!";
        }

        // Construct the texts.
        for (let i = 0; i < commaSplit.length; i++) {
            commaSplit[i] = commaSplit[i].trim();
        }
        const texts = [spaceSplit.slice(3).join(" ")].concat(commaSplit.slice(1));

        // Subscribe new dank time for the chat, replacing any with the same hour and minute.
        try {
            const dankTime = new DankTime(hour, minute, texts, () => points);
            chat.addDankTime(dankTime);

            // Reschedule notifications just to make sure, if applicable.
            if (chat.running) {
                if (chat.normaltimesNotifications) {
                    this.scheduler.unscheduleDankTime(chat, dankTime);
                    this.scheduler.scheduleDankTime(chat, dankTime);
                }
            }
            return "⏰ Added the new time!";
        } catch (err) {
            return "⚠️ " + err.message;
        }
    }

    public editTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {

        // Split string and ensure it contains at least 3 items.
        const split = match.split(" ");
        if (split.length < 3) {
            return "⚠️ Not enough arguments! Format: /edittime [hour] [minute] [points]";
        }

        // Identify and verify arguments.
        const hour = Number(split[0]);
        const minute = Number(split[1]);
        const points = this.util.parseScoreInput(split[2], undefined, undefined);

        if (isNaN(hour)) {
            return "⚠️ The hour must be a number!";
        }
        if (isNaN(minute)) {
            return "⚠️ The minute must be a number!";
        }
        if (points === null) {
            return "⚠️ The points must be a number!";
        }

        // Update dank time if it exists, otherwise just send an info message.
        const dankTime = chat.getDankTime(hour, minute);

        if (dankTime === null) {
            return "⚠️ No dank time known with that hour and minute!";
        }
        try {
            dankTime.setPoints(() => points);
            return "💾 Updated the time!";
        } catch (err) {
            return "⚠️ " + err.message;
        }
    }

    public removeTime(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {

        // Split string and ensure it contains at least 2 items.
        const split = match.split(" ");
        if (split.length < 2) {
            return "⚠️ Not enough arguments! Format: /removetime [hour] [minute]";
        }

        // Identify and verify arguments.
        const hour = Number(split[0]);
        const minute = Number(split[1]);
        if (isNaN(hour)) {
            return "⚠️ The hour must be a number!";
        }
        if (isNaN(minute)) {
            return "⚠️ The minute must be a number!";
        }

        // Remove dank time if it exists, otherwise just send an info message.
        const dankTime = chat.getDankTime(hour, minute);

        if (dankTime !== null && chat.removeDankTime(hour, minute)) {
            this.scheduler.unscheduleDankTime(chat, dankTime);
            return "🚮 Removed the time!";
        } else {
            return "⚠️ No dank time known with that hour and minute!";
        }
    }

    public plugins(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        let out = "<b>🔌 PLUGINS</b>\n";
        chat.pluginhost.plugins.forEach((plugin: AbstractPlugin) => {
            out += `\n- ${plugin.name} ${plugin.version}`;
        });
        return out;
    }

    public whatsNewMessage(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        return this.util.releaseLogToWhatsNewMessage(this.releaseLog);
    }

    public donate(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (!msg.reply_to_message) {
            return "✋  I only work when you reply to a message by the user you are trying to donate to";
        }
        if (msg.reply_to_message?.from?.id === user.id) {
            return "✋  Donating to yourself? Weirdo";
        }
        if (msg.reply_to_message?.from?.is_bot) {
            return "✋  Bots have no use for points, silly";
        }
        const recipientId = msg.reply_to_message?.from?.id;

        if (!recipientId) {
            return "⚠️  Failed to identify to whomst you're donating";
        }
        if (!match) {
            return "✋  Not enough arguments! Format: /donate [amount]";
        }
        let amount = this.util.parseScoreInput(match, user.score, undefined);

        if (amount === null || (amount % 1 !== 0) || amount < 1) {
            return "✋  The amount has to be a whole numeric value";
        }
        if (amount > user.score) {
            return "✋  You can't give away more than you own";
        }

        const recipient: User = chat.getOrCreateUser(recipientId, msg.reply_to_message?.from?.username);
        chat.alterUserScore(new AlterUserScoreArgs(user, -amount, AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME,
            AlterUserScoreArgs.DONATION_GIVEN_REASON, undefined, true));
        amount = chat.alterUserScore(new AlterUserScoreArgs(recipient, amount,
            AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME, AlterUserScoreArgs.DONATION_RECEIVED_REASON, undefined, true));

        return `🎉 ${user.name} donated ${amount} internet points to ${recipient.name} 🎉`;
    }

    public avatars(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (user.availableAvatars.length < 1) {
            return "😔 You don't have any avatars...";
        } else {
            return "You have the following avatars available: " + user.availableAvatars.join(" ");
        }
    }

    public resetAvatar(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        user.currentAvatar = "";
        return "Your avatar has been reset. How boring.";
    }

    public setAvatar(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (!match) {
            return "⚠️ You have to specify an avatar, smarty-pants.";
        }
        const emojiMatch = Object.entries(emojilib).map(([emoji, names]) => emoji).find((e) => e.includes(match));

        if (!emojiMatch) {
            return "😔 That is not a valid avatar...";
        }
        if (user.availableAvatars.indexOf(emojiMatch) > -1) {
            user.currentAvatar = emojiMatch;
            return `Updated your avatar to ${user.currentAvatar}!`;
        }
        return "😔 You don't have that avatar...";
    }

    public changeBroadcastSettings(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (!match) {
            return "⚠️ Usage: /everyone [opt-in|opt-out]";
        }
        if (/opt-in/i.test(msg.text ?? "")) {
            user.broadcastOptin = true;
            return "📢 Okay, you will now receive messages addressed to everyone.";
        } else if (/opt-out/i.test(msg.text ?? "")) {
            user.broadcastOptin = false;
            return "🔇 Okay, you won't receive messages addressed to everyone anymore.";
        } else {
            return "⚠️ Usage: /everyone [opt-in|opt-out]";
        }
    }

    public checkPointsForUser(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        return `💰 You have ${user?.score ?? "Unknown"} points.`;
    }

    public shutdown(chat: Chat, user: User, msg: TelegramBot.Message, match: string): BotCommandConfirmationQuestion {
        const confirmationQuestion = new BotCommandConfirmationQuestion();
        confirmationQuestion.actionOnConfirm = () => process.exit(0);
        return confirmationQuestion;
    }

    public updateUserPoints(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        if (!msg.reply_to_message) {
            return "✋  I only work when you reply to a message by the user you are trying to update the points of";
        }
        if (msg.reply_to_message?.from?.is_bot) {
            return "✋  Bots have no use for points, silly";
        }
        const recipientId = msg.reply_to_message?.from?.id;

        if (!recipientId) {
            return "⚠️  Failed to identify whomst's points you're updating";
        }
        if (!match) {
            return "✋  Not enough arguments! Format: /updateuserpoints [amount]";
        }
        let amount = this.util.parseScoreInput(match, undefined, undefined);

        if (amount === null || (amount % 1 !== 0)) {
            return "✋  The amount has to be a whole numeric value";
        }
        const recipient: User = chat.getOrCreateUser(recipientId, msg.reply_to_message?.from?.username);
        amount = chat.alterUserScore(new AlterUserScoreArgs(recipient, amount,
            AlterUserScoreArgs.DANKTIMESBOT_ORIGIN_NAME, AlterUserScoreArgs.UPDATE_USER_POINTS_GIVEN_REASON));

        return `🎉 ${user.name} updated @${recipient.name}'s points by ${amount} 🎉`;
    }

    private doTimezoneSettingSideEffects(chat: Chat): void {
        this.scheduler.unscheduleAllOfChat(chat);
        this.scheduler.scheduleAllOfChat(chat);
    }

    private doNumberOfRandomTimesSettingSideEffects(chat: Chat): void {
        if (chat.running) {
            this.scheduler.unscheduleRandomDankTimesOfChat(chat);
            this.scheduler.scheduleRandomDankTimesOfChat(chat);
        }
    }

    private doNotificationsSettingSideEffects(chat: Chat): void {
        if (chat.running) {
            this.scheduler.unscheduleDankTimesOfChat(chat);

            if (chat.normaltimesNotifications) {
                this.scheduler.scheduleDankTimesOfChat(chat);
            }
        }
    }
}
