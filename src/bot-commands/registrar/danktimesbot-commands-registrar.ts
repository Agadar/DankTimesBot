import { IChatRegistry } from "../../chat-registry/i-chat-registry";
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

      this.telegramClient.registerCommand(new BotCommand("help", "shows the available this.commands",
        this.dankTimesBotCommands, this.dankTimesBotCommands.help)),

      this.telegramClient.registerCommand(new BotCommand("leaderboard", "shows the leaderboard",
        this.dankTimesBotCommands, this.dankTimesBotCommands.leaderBoard)),

      this.telegramClient.registerCommand(new BotCommand("removetime", "removes a dank time. format: [hour] [minute]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.removeTime, true)),

      this.telegramClient.registerCommand(new BotCommand("reset", "resets the scores",
        this.dankTimesBotCommands, this.dankTimesBotCommands.resetChat, true, true)),

      this.telegramClient.registerCommand(new BotCommand("setdailyrandomfrequency",
        "sets the number of random dank times per day. format: [number]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.setDailyRandomTimes, true)),

      this.telegramClient.registerCommand(new BotCommand("setdailyrandompoints",
        "sets the points for random daily dank times. format: [number]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.setDailyRandomTimesPoints, true)),

      this.telegramClient.registerCommand(new BotCommand("setmultiplier",
        "sets the multiplier for the score of the first user to score. format: [number]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.setMultiplier, true)),

      this.telegramClient.registerCommand(new BotCommand("settimezone", "sets the time zone. format: [timezone]",
        this.dankTimesBotCommands, this.dankTimesBotCommands.setTimezone, true)),

      this.telegramClient.registerCommand(new BotCommand("settings", "shows the current settings",
        this.dankTimesBotCommands, this.dankTimesBotCommands.chatSettings)),

      this.telegramClient.registerCommand(new BotCommand("start", "starts keeping track of scores and sending messages",
        this.dankTimesBotCommands, this.dankTimesBotCommands.startChat, true)),

      this.telegramClient.registerCommand(new BotCommand("stop", "stops keeping track of scores and sending messages",
        this.dankTimesBotCommands, this.dankTimesBotCommands.stopChat, true)),

      this.telegramClient.registerCommand(new BotCommand("toggleautoleaderboards",
        "toggles whether a leaderboard is auto-posted 1 minute after every dank time",
        this.dankTimesBotCommands, this.dankTimesBotCommands.toggleAutoLeaderboards, true)),

      this.telegramClient.registerCommand(new BotCommand("toggledanktimenotifications",
        "toggles whether notifications of normal dank times are sent",
        this.dankTimesBotCommands, this.dankTimesBotCommands.toggleNotifications, true)),

      this.telegramClient.registerCommand(new BotCommand("togglefirstnotifications",
        "toggles whether this chat announces the first user to score",
        this.dankTimesBotCommands, this.dankTimesBotCommands.toggleFirstNotifications, true)),

      this.telegramClient.registerCommand(new BotCommand("togglehandicaps",
        "toggles whether the users with the lowest scores earn more points",
        this.dankTimesBotCommands, this.dankTimesBotCommands.toggleHandicaps, true)),

      this.telegramClient.registerCommand(new BotCommand("togglehardcoremode",
        "toggles whether every day, users are punished if they haven't scored the previous day",
        this.dankTimesBotCommands, this.dankTimesBotCommands.toggleHardcoreMode, true)),

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
        if(msg.text.length > 1 && msg.text[0] === "/")
        {
          let params: string[] = msg.text.slice(1).split(" ").slice(1);
          output = chat.pluginhost().TriggerCommand(msg.text.slice(1).split(" ")[0], (params) ? params : []);
        }
        else
        {
          output = chat.processMessage(msg.from.id, msg.from.username || "anonymous", msg.text, msg.date);
        }
        output = output.filter(msg => msg.length > 0);
        return output;
    }
    return [];
  }
}
