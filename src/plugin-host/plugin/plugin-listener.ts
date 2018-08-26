/**
 * Listens to events fired by plugins.
 */
export interface IPluginListener {

    /**
     * Fired when a plugin wants to send a chat message.
     * @param chatId The id of the chat to send a message to.
     * @param htmlMessage The HTML message to send.
     * @param replyToMessageId The (optional) id of the message to reply to.
     * @param forceReply Whether to force the replied-to or tagged user to reply to this message.
     */
    onPluginWantsToSendChatMessage(chatId: number, htmlMessage: string,
                                   replyToMessageId: number, forceReply: boolean): void;
}
