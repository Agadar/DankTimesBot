import { Chat } from "../chat/chat";

/**
 * Listens to a chat registry. Can possibly be expanded in the future.
 */
export interface IChatRegistryListener {

  /**
   * Called when a new chat has been registered.
   */
  onChatCreated(chat: Chat): void;
}
