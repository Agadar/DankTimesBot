import { BotCommand } from "../../src/bot-commands/bot-command";
import { Chat } from "../../src/chat/chat";
import { ChatSettingTemplate } from "../../src/chat/settings/chat-setting-template";
import { User } from "../../src/chat/user/user";
import {
  ChatMessageEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/chat-message-event-arguments";
import {
  LeaderboardPostEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/leaderboard-post-event-arguments";
import {
  EmptyEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/empty-event-arguments";
import { PluginEvent } from "../../src/plugin-host/plugin-events/plugin-event-types";
import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";
import { PreUserScoreChangedEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/pre-user-score-changed-event-arguments";
import { PostUserScoreChangedEventArguments } from "../../src/plugin-host/plugin-events/event-arguments/post-user-score-changed-event-arguments";
import { AlterUserScoreArgs } from "../../src/chat/alter-user-score-args";

/**
 * Example of the simplest DankTimesBot
 * plugin. Can be used as a template to
 * build new plugins.
 */
export class Plugin extends AbstractPlugin {
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

    this.subscribeToPluginEvent(PluginEvent.PreUserScoreChange, (data: PreUserScoreChangedEventArguments) => {
      const oldChange = data.changeInScore;
      data.changeInScore += 5;
      this.sendMessage(data.chat.id, `Example of a pre user score change event. Origin plugin: ${data.nameOfOriginPlugin}` +
      `, Reason: ${data.reason}, Player: ${data.user.name}, old score change: ${oldChange}, new score change: ${data.changeInScore}`);
    });

    this.subscribeToPluginEvent(PluginEvent.PostUserScoreChange, (data: PostUserScoreChangedEventArguments) => {
      this.sendMessage(data.chat.id, `Example of a post user score change event. Origin plugin: ${data.nameOfOriginPlugin}` +
      `, Reason: ${data.reason}, Player: ${data.user.name}, score change: ${data.changeInScore}`);
    });

    this.subscribeToPluginEvent(PluginEvent.ChatMessage, (data: ChatMessageEventArguments) => {
      data.botReplies = data.botReplies.concat(`Example of a chat message event`);
    });

    this.subscribeToPluginEvent(PluginEvent.LeaderboardPost, (data: LeaderboardPostEventArguments) => {
      data.leaderboardText = data.leaderboardText + "\n\n Example of a leaderboard post event.";
    });

    this.subscribeToPluginEvent(PluginEvent.BotShutdown, (data: EmptyEventArguments) => {
      console.log("Example of a bot shutdown event.");
    });

    this.subscribeToPluginEvent(PluginEvent.NightlyUpdate, (data: EmptyEventArguments) => {
      console.log("Example of a nightly update event.");
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
    const echoCommand = new BotCommand("echo", "echoes what a user sent", this.echo.bind(this));
    const printMoneyCommand = new BotCommand("printmoney", "gives the user 10 free points", this.printMoney.bind(this));
    return [echoCommand, printMoneyCommand];
  }

  private echo(chat: Chat, user: User, msg: any, match: string[]): string {
    setTimeout(() => {
      this.sendMessage(chat.id, "Example of sendMessage", msg.id, true).then((res) => {
        setTimeout(() => {
          this.deleteMessage(chat.id, res.message_id);
        }, 3000);
      });
    }, 3000);
    return `${user.name} said: '${match[0].split(" ")[1]}'`;
  }

  private printMoney(chat: Chat, user: User, msg: any, match: string[]): string {
    const alterUserScoreArgs = new AlterUserScoreArgs(user, 10, this.name, "printmoney");
    const correctedAmount = chat.alterUserScore(alterUserScoreArgs);
    return `Gave ${user.name} ${correctedAmount} free points!`;
  }
}
