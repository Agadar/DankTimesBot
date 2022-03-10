import { Chat } from "../../../chat/chat";
import { DankTime } from "../../../dank-time/dank-time";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Event Arguments for the PreDankTime event.
 */
export class PreDankTimeEventArguments extends PluginEventArguments {

    /**
   * The chat in which the danktime is occuring.
   */
    public readonly chat: Chat;
    /**
   * The danktime that is occuring.
   */
    public readonly dankTime: DankTime;

    /**
   * Constructor.
   * @param chat TThe chat in which the danktime is occuring.
   * @param dankTime The danktime that is occuring.
   */
    constructor(chat: Chat, dankTime: DankTime) {
        super();
        this.chat = chat;
        this.dankTime = dankTime;
    }
}
