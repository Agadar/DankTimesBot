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
     * @param match The matched regex of said object.
     * @param botCommand The command requiring confirmation to execute.
     */
    constructor(
        public readonly chat: Chat,
        public readonly user: User,
        public readonly msg: any,
        public readonly match: string[],
        public readonly botCommand: BotCommand,
    ) { }
}
