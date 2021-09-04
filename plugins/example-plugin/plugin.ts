import { BotCommand } from "../../src/bot-commands/bot-command";
import { Chat } from "../../src/chat/chat";
import { ChatSettingTemplate } from "../../src/chat/settings/chat-setting-template";
import { User } from "../../src/chat/user/user";
import {
  ChatMessagePluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/chat-message-plugin-event-arguments";
import {
  LeaderboardPostPluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/leaderboard-post-plugin-event-arguments";
import {
  NoArgumentsPluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/no-arguments-plugin-event-arguments";
import {
  UserScoreChangedPluginEventArguments,
} from "../../src/plugin-host/plugin-events/event-arguments/user-score-changed-plugin-event-arguments";
import { PluginEvent } from "../../src/plugin-host/plugin-events/plugin-event-types";
import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";

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

    this.subscribeToPluginEvent(PluginEvent.BotStartup, (data: NoArgumentsPluginEventArguments) => {
      console.log("Example of a bot startup event.");
    });

    this.subscribeToPluginEvent(PluginEvent.UserScoreChange, (data: UserScoreChangedPluginEventArguments) => {
      this.sendMessage(data.chat.id, `A player changed score! Player: ${data.user.name}, change: ${data.changeInScore}`);
    });

    this.subscribeToPluginEvent(PluginEvent.ChatMessage, (data: ChatMessagePluginEventArguments) => {
      data.botReplies = data.botReplies.concat(`Example of a chat message event`);
    });

    this.subscribeToPluginEvent(PluginEvent.LeaderboardPost, (data: LeaderboardPostPluginEventArguments) => {
      data.leaderboardText = data.leaderboardText + "\n\n Example of a leaderboard post event.";
    });

    this.subscribeToPluginEvent(PluginEvent.BotShutdown, (data: NoArgumentsPluginEventArguments) => {
      console.log("Example of a bot shutdown event.");
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
    return [echoCommand];
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
}
