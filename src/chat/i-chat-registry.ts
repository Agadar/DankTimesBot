import { Chat } from "./chat";

/**
 * Keeps track of all the chats.
 */
export interface IChatRegistry {

  /**
   * Re-maps the chat mapped to the supplied oldId to the specified newId.
   */
  setChatId(oldId: number, newId: number): void;

  /**
   * Gets the chat with the supplied id, otherwise creates and returns a new one.
   */
  getOrCreateChat(id: number): Chat;

  setInitialChats(chats: Map<number, Chat>): void;
}
