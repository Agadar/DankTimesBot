import TelegramBot from "node-telegram-bot-api";
import { IChatRegistry } from "../../chat-registry/i-chat-registry";
import { ITelegramClient } from "../../telegram-client/i-telegram-client";
import { BotCommand } from "../bot-command";
import { BotCommandRegistry } from "../bot-command-registry";
import { IDankTimesBotCommands } from "../commands/i-danktimesbot-commands";
import { IDankTimesBotCommandsRegistrar } from "./i-danktimesbot-commands-registrar";

export class DankTimesBotCommandsRegistrar implements IDankTimesBotCommandsRegistrar {

    constructor(
    private readonly botCommandRegistry: BotCommandRegistry,
    private readonly telegramClient: ITelegramClient,
    private readonly chatRegistry: IChatRegistry,
    private readonly dankTimesBotCommands: IDankTimesBotCommands,
    ) { }

    public async registerDankTimesBotCommands(): Promise<void> {
        await Promise.all([

            this.botCommandRegistry.registerCommand(new BotCommand(["avatars"], "shows your available leaderboard avatars",
                this.dankTimesBotCommands.avatars.bind(this.dankTimesBotCommands), true, false)),

            this.botCommandRegistry.registerCommand(new BotCommand(["addtime"],
                "adds a dank time. format: [hour] [minute] [points] [text1] [text2] etc.",
                this.dankTimesBotCommands.addTime.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["danktimes"], "shows the user-specified dank times",
                this.dankTimesBotCommands.dankTimes.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["donate"], "donates points to another user",
                this.dankTimesBotCommands.donate.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["edittime", "updatetime", "settime"],
                "edits a dank time. format: [hour] [minute] [points]",
                this.dankTimesBotCommands.editTime.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["everyone"], "sets your @Everyone tag settings.",
                this.dankTimesBotCommands.changeBroadcastSettings.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["help"], "shows the available commands",
                this.dankTimesBotCommands.help.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["leaderboard"], "shows the leaderboard",
                this.dankTimesBotCommands.leaderBoard.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["plugins"], "shows the currently active plugins",
                this.dankTimesBotCommands.plugins.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["points"], "check your current dank time points.",
                this.dankTimesBotCommands.checkPointsForUser.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["removetime"],
                "removes a dank time. format: [hour] [minute]",
                this.dankTimesBotCommands.removeTime.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["reset"], "resets the leaderboard",
                this.dankTimesBotCommands.resetChat.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["resetavatar"], "resets your leaderboard avatar",
                this.dankTimesBotCommands.resetAvatar.bind(this.dankTimesBotCommands), true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["setavatar"], "sets your leaderboard avatar. format: [avatar]",
                this.dankTimesBotCommands.setAvatar.bind(this.dankTimesBotCommands), true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["settings"], "shows the current settings values",
                this.dankTimesBotCommands.settings.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["settingshelp"], "shows the settings descriptions",
                this.dankTimesBotCommands.settingshelp.bind(this.dankTimesBotCommands))),

            this.botCommandRegistry.registerCommand(new BotCommand(["set"], "sets a setting. format: [name] [value]",
                this.dankTimesBotCommands.set.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["start"],
                "starts keeping track of scores and sending messages",
                this.dankTimesBotCommands.startChat.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["stop"],
                "stops keeping track of scores and sending messages",
                this.dankTimesBotCommands.stopChat.bind(this.dankTimesBotCommands), true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["whatsnew"],
                "shows the release notes of the current version",
                this.dankTimesBotCommands.whatsNewMessage.bind(this.dankTimesBotCommands))),

            // Developer-only commands

            this.botCommandRegistry.registerCommand(new BotCommand(["shutdown"],
                "shuts down the bot with the expectation its container restarts the bot",
                this.dankTimesBotCommands.shutdown.bind(this.dankTimesBotCommands), false, true, true)),

            this.botCommandRegistry.registerCommand(new BotCommand(["updateuserpoints"],
                "updates a user's points by a specified amount",
                this.dankTimesBotCommands.updateUserPoints.bind(this.dankTimesBotCommands), false, true, true)),
        ]);

        this.telegramClient.setOnAnyText((msg) => this.onAnyText(msg));
    }

    private onAnyText(msg: TelegramBot.Message): string[] {
        if (msg.migrate_to_chat_id) { // If the chat was migrated, then update the registry.
            this.chatRegistry.setChatId(msg.chat.id, msg.migrate_to_chat_id);

        } else if (msg.left_chat_member) { // If a chat member left, remove him from the chat scores.
            const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
            const removedUser = chat.removeUser(msg.left_chat_member.id);

            if (removedUser) {
                return [`${removedUser.name} left! Their final score was ${removedUser.score}!`];
            }

        } else if (msg.text || msg.dice) { // Let the appropriate chat process the message.
            const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
            let output = chat.processMessage(msg);
            output = output.filter((filteredmsg) => filteredmsg.length > 0);
            return output;
        }
        return [];
    }
}
