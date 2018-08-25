import { BotCommand } from "../../src/bot-commands/bot-command";
import { Chat } from "../../src/chat/chat";
import { ChatSettingTemplate } from "../../src/chat/settings/chat-setting-template";
import { User } from "../../src/chat/user/user";
import {
  ChatMessagePluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/chat-message-plugin-event-arguments";
import {
  LeaderboardResetPluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/leaderboard-reset-plugin-event-arguments";
import {
  NoArgumentsPluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/no-arguments-plugin-event-arguments";
import {
  UserScoreChangedPluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PluginEvent } from "../../src/plugin-host/plugin-events/plugin-event-types";
import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";
import { ExamplePluginData } from "./example-plugin-data";

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
    super("Example Plugin", "1.0.0", {});

    // Example of sample dat
    this.data = new ExamplePluginData();
    this.data.TestNumber = 1;

    this.subscribeToPluginEvent(PluginEvent.UserScoreChange, (data: UserScoreChangedPluginEventArguments) => {
      return [`A player changed score! Player: ${data.user.name}, change: ${data.changeInScore}`,
        `Example of current leaderboard:`,
      data.chat.generateLeaderboard(false)];
    });

    this.subscribeToPluginEvent(PluginEvent.ChatMessage, (data: ChatMessagePluginEventArguments) => {
      return [`Example of a Chat Message Event`];
    });

    this.subscribeToPluginEvent(PluginEvent.LeaderboardReset, (data: LeaderboardResetPluginEventArguments) => {
      return [`The leaderboard was reset for chat: ${data.chat.id}`];
    });

    this.subscribeToPluginEvent(PluginEvent.BotShutdown, (data: NoArgumentsPluginEventArguments) => {
      console.log("Shutting down plugin! " + this.name);
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
    const echoCommand = new BotCommand("echo", "echoes what a user sent", this.echo);
    return [echoCommand];
  }

  private echo(chat: Chat, user: User, msg: any, match: string[]): string {
    return `${user.name} said: '${match[0].split(" ")[1]}'`;
  }
}
