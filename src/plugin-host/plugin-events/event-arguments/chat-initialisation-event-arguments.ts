import { Chat } from "../../../chat/chat";
import { PluginEventArguments } from "../plugin-event-arguments";

/**
 * Chat Initialisation Plugin Event Arguments.
 */
export class ChatInitialisationEventArguments extends PluginEventArguments {

  /**
   * The freshly initialised chat.
   */
   public readonly chat: Chat;

   /**
    * Constructor.
    * @param chat The freshly initialised chat.
    */
   constructor(chat: Chat) {
     super();
     this.chat = chat;
   }
}
