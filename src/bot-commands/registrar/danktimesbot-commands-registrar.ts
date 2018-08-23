import { IChatRegistry } from "../../chat-registry/i-chat-registry";
import { ChatMessage } from "../../chat/chat-message/chat-message";
import { ITelegramClient } from "../../telegram-client/i-telegram-client";
import { BotCommand } from "../bot-command";
import { IDankTimesBotCommands } from "../commands/i-danktimesbot-commands";
import { IDankTimesBotCommandsRegistrar } from "./i-danktimesbot-commands-registrar";

export class DankTimesBotCommandsRegistrar implements IDankTimesBotCommandsRegistrar {

  constructor(
    private readonly telegramClient: ITelegramClient,
    private readonly chatRegistry: IChatRegistry,
    private readonly dankTimesBotCommands: IDankTimesBotCommands,
  ) { }

  public async registerDankTimesBotCommands(): Promise<void> {
    await Promise.all([

      this.telegramClient.registerCommand(new BotCommand("addtime",
        "adds a dank time. format: [hour] [minute] [points] [text1] [text2] etc.",
        this.dankTimesBotCommands, this.dankTimesBotCommands.addTime, true)),

      this.telegramClient.registerCommand(new BotCommand("danktimes", "shows the user-specified dank times",
        this.dankTimesBotCommands, this.dankTimesBotCommands.dankTimes)),

      this.telegramClient.registerCommand(new BotCommand("help", "shows the available commands",
        this.dankTimesBotCommands, this.dankTimesBotCommands.help)),

      this.telegramClient.registerCommand(new BotCommand("leaderboard", "shows the leaderboard",
        this.dankTimesBotCommands, this.dankTimesBotCommands.leaderBoard)),

      this.telegramClient.registerCommand(new BotCommand("plugins", "shows the currently active plugins",
        this.dankTimesBotCommands, this.dankTimesBotCommands.plugins, true)),

      this.telegramClient.registerCommand(new BotCommand("removetime", "removes a dank time. format: [hour] [minute]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.removeTime, true)),

      this.telegramClient.registerCommand(new BotCommand("reset", "resets the leaderboard",
        this.dankTimesBotCommands, this.dankTimesBotCommands.resetChat, true, true)),

      this.telegramClient.registerCommand(new BotCommand("settings", "shows the current settings values",
        this.dankTimesBotCommands, this.dankTimesBotCommands.settings)),

      this.telegramClient.registerCommand(new BotCommand("settingshelp", "shows the settings descriptions",
        this.dankTimesBotCommands, this.dankTimesBotCommands.settingshelp)),

      this.telegramClient.registerCommand(new BotCommand("set", "sets a setting. format: [name] [value]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.set, true)),

      this.telegramClient.registerCommand(new BotCommand("start", "starts keeping track of scores and sending messages",
        this.dankTimesBotCommands, this.dankTimesBotCommands.startChat, true)),

      this.telegramClient.registerCommand(new BotCommand("stop", "stops keeping track of scores and sending messages",
        this.dankTimesBotCommands, this.dankTimesBotCommands.stopChat, true)),

      this.telegramClient.registerCommand(new BotCommand("whatsnew", "shows the release notes of the current version",
        this.dankTimesBotCommands, this.dankTimesBotCommands.whatsNewMessage)),
    ]);

    this.telegramClient.setOnAnyText((msg) => this.onAnyText(msg));
  }

  private onAnyText(msg: any): string[] {
    if (msg.migrate_to_chat_id) { // If the chat was migrated, then update the registry.
      this.chatRegistry.setChatId(msg.chat.id, msg.migrate_to_chat_id);

    } else if (msg.left_chat_member) { // If a chat member left, remove him from the chat scores.
      const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
      const removedUser = chat.removeUser(msg.left_chat_member.id);

      if (removedUser) {
        return [`${removedUser.name} left! Their final score was ${removedUser.score}!`];
      }

    } else if (msg.text) { // Let the appropriate chat process the message.
      const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
      let output: string[] = [];
      if (msg.text.length > 1 && msg.text[0] === "/") {
        const dtMessage = new ChatMessage(msg.text.split(" ").slice(1).join(" "),
          (msg.reply_to_message) ? msg.reply_to_message.text : "");
        output = chat.pluginhost.triggerCommand(msg.text.slice(1).split(" ")[0], chat, dtMessage);
      } else {
        output = chat.processMessage(msg.from.id, msg.from.username || "anonymous", msg.text, msg.date);
      }
      output = output.filter((filteredmsg) => filteredmsg.length > 0);
      return output;
    }
    return [];
  }
}
