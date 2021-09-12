import TelegramBot from "node-telegram-bot-api";
import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { BotCommand } from "./bot-command";

/**
 * Holds data necessary to execute a command that is awaiting confirmation.
 */
export class AwaitingConfirmationData {

    /**
     * Constructor.
     * @param chat The chat in which the command requiring confirmation was called.
     * @param user The user that called the command.
     * @param msg The original raw Telegram message object.
     * @param params The params of the message, or empty if none were given.
     * @param botCommand The command requiring confirmation to execute.
     */
    constructor(
        public readonly chat: Chat,
        public readonly user: User,
        public readonly msg: TelegramBot.Message,
        public readonly params: string,
        public readonly botCommand: BotCommand,
    ) { }
}
