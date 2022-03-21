import TelegramBot from "node-telegram-bot-api";
import { BotCommand } from "../../src/bot-commands/bot-command";
import { AlterUserScoreArgs } from "../../src/chat/alter-user-score-args";
import { Chat } from "../../src/chat/chat";
import { ChatSettingTemplate } from "../../src/chat/settings/chat-setting-template";
import { User } from "../../src/chat/user/user";
import { ChatInitialisationEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/chat-initialisation-event-arguments";
import { ChatMessageEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/chat-message-event-arguments";
import { CustomEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/custom-event-arguments";
import { EmptyEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/empty-event-arguments";
import { LeaderboardPostEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/leaderboard-post-event-arguments";
import { PostDankTimeEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/post-dank-time-event-arguments";
import { PostUserScoreChangedEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/post-user-score-changed-event-arguments";
import { PreDankTimeEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/pre-dank-time-event-arguments";
import { PreUserScoreChangedEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/pre-user-score-changed-event-arguments";
import { PluginEvent } from "../../src/plugin-host/plugin-events/plugin-event-types";
import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";

/**
 * Example of the simplest DankTimesBot
 * plugin. Can be used as a template to
 * build new plugins.
 */
export class Plugin extends AbstractPlugin {

    private static readonly PRINT_MONEY_REASON = "printmoney";

    /**
     * A plugin should call its base constructor to
     * provide it with an identifier, a version
     * and some optional data.
     */
    constructor() {
        super("Example Plugin", "1.1.0");

        this.subscribeToPluginEvent(PluginEvent.BotStartup, (data: EmptyEventArguments) => {
            console.log("Example of a bot startup event.");
        });

        this.subscribeToPluginEvent(PluginEvent.ChatInitialisation, (data: ChatInitialisationEventArguments) => {
            console.log("Example of chat initialisation event.");
        });

        this.subscribeToPluginEvent(PluginEvent.PreDankTime, (data: PreDankTimeEventArguments) => {
            console.log(`Example of pre-danktime event. Time: ${data.dankTime.hour}:${data.dankTime.minute}`);
        });

        this.subscribeToPluginEvent(PluginEvent.PostDankTime, (data: PostDankTimeEventArguments) => {
            console.log(`Example of post-danktime event. Time: ${data.dankTime.hour}:${data.dankTime.minute},
             Scorers: ${data.users.map(user => user.name).join(", ")}`);
        });

        this.subscribeToPluginEvent(PluginEvent.PreUserScoreChange, (data: PreUserScoreChangedEventArguments) => {
            const oldChange = data.changeInScore;
            data.changeInScore += 5;
            this.sendMessage(data.chat.id, `Example of a pre user score change event. Origin plugin: ${data.nameOfOriginPlugin}` +
                `, Reason: ${data.reason}, Player: ${data.user.name}, old score change: ${oldChange}, new score change: ${data.changeInScore}`);
        }, this.name, Plugin.PRINT_MONEY_REASON);

        this.subscribeToPluginEvent(PluginEvent.PostUserScoreChange, (data: PostUserScoreChangedEventArguments) => {
            this.sendMessage(data.chat.id, `Example of a post user score change event. Origin plugin: ${data.nameOfOriginPlugin}` +
                `, Reason: ${data.reason}, Player: ${data.user.name}, score change: ${data.changeInScore}`);
        }, this.name, Plugin.PRINT_MONEY_REASON);

        this.subscribeToPluginEvent(PluginEvent.ChatMessage, (data: ChatMessageEventArguments) => {
            data.botReplies = data.botReplies.concat("Example of a chat message event");
        });

        this.subscribeToPluginEvent(PluginEvent.LeaderboardPost, (data: LeaderboardPostEventArguments) => {
            data.leaderboardText = data.leaderboardText + "\n\n Example of a leaderboard post event.";
        });

        this.subscribeToPluginEvent(PluginEvent.BotShutdown, (data: EmptyEventArguments) => {
            console.log("Example of a bot shutdown event.");
        });

        this.subscribeToPluginEvent(PluginEvent.HourlyTick, (data: EmptyEventArguments) => {
            console.log("Example of an hourly tick event.");
        });

        this.subscribeToPluginEvent(PluginEvent.NightlyUpdate, (data: EmptyEventArguments) => {
            console.log("Example of a nightly update event.");
        });

        this.subscribeToPluginEvent(PluginEvent.Custom, (data: CustomEventArguments) => {
            console.log(`Example of a custom plugin event. Origin plugin: ${data.nameOfOriginPlugin}, ` +
                `reason: ${data.reason}, event data: ${data.eventData}`);
        });
    }

    /**
     * @override
     */
    public getPluginSpecificChatSettings(): Array<ChatSettingTemplate<any>> {
        return [new ChatSettingTemplate("example.pluginsetting", "example of a custom plugin setting", "some string value",
            (original) => original, (value) => null)];
    }

    /**
     * @override
     */
    public getPluginSpecificCommands(): BotCommand[] {
        const echoCommand = new BotCommand(["echo"], "echoes what a user sent", this.echo.bind(this));
        const printMoneyCommand = new BotCommand(["printmoney", "freemoney"], "gives the user 10 free points", this.printMoney.bind(this));
        const firePluginEvent = new BotCommand(["fire_event"], "fires a custom plugin event", this.firePluginEvent.bind(this));
        return [echoCommand, printMoneyCommand, firePluginEvent];
    }

    private echo(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        setTimeout(() => {
            this.sendMessage(chat.id, "Example of sendMessage. This message will be edited in <b>3</b> seconds, and deleted after <b>6</b>", msg?.message_id, false)
                .then((res) => {
                    if (res) {
                        // Note: Do not use editMessage with forceReply = true. It will not work.
                        setTimeout(() => this.editMessage(res.chat.id, res.message_id, "This message will be deleted in <b>3</b> seconds!"), 3000);
                        setTimeout(() => this.deleteMessage(chat.id, res.message_id), 6000);
                    }
                });
        }, 3000);
        return `${user.name} said: '${match}'`;
    }

    private printMoney(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        const alterUserScoreArgs = new AlterUserScoreArgs(user, 10, this.name, Plugin.PRINT_MONEY_REASON);
        const correctedAmount = chat.alterUserScore(alterUserScoreArgs);
        return `Gave ${user.name} ${correctedAmount} free points!`;
    }

    private firePluginEvent(chat: Chat, user: User, msg: TelegramBot.Message, match: string): string {
        this.fireCustomEvent("testing", ["One", "Two", "Three"]);
        return "";
    }
}
