/**
 * Class representing a chat message.
 * A chat message extracts certain values from an
 * incoming telegram chat message and puts them into
 * this data object.
 *
 * Initially this class is implemented in order to
 * support 'reply' messages in plugins.
 */
export class ChatMessage {
    public readonly text: string;
    public readonly reply_text: string;

    constructor(text = "", reply_text = "") {
        this.text = text;
        this.reply_text = reply_text;
    }
}
