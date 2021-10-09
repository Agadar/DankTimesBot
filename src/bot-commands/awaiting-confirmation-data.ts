import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { BotCommandConfirmationQuestion } from "./bot-command-confirmation-question";

/**
 * Holds data necessary to execute a command that is awaiting confirmation.
 */
export class AwaitingConfirmationData {

    /**
     * Constructor.
     * @param chat The chat in which the command requiring confirmation was called.
     * @param user The user that called the command.
     * @param question The confirmation question.
     */
    constructor(
        public readonly chat: Chat,
        public readonly user: User,
        public readonly question: BotCommandConfirmationQuestion,
    ) { }
}
