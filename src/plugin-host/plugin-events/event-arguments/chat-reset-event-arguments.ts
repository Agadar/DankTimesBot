import { Chat } from "../../../chat/chat";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Chat Reset Plugin Event Arguments.
 */
export class ChatResetEventArguments extends PluginEventArguments {

    /**
     * The chat that is reset.
     */
    public readonly chat: Chat;

    /**
     * Constructor.
     * @param chat The chat that is reset.
     */
    constructor(chat: Chat) {
        super();
        this.chat = chat;
    }
}
