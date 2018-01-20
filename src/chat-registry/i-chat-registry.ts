import { BasicChat } from "../chat/basic-chat";
import { Chat } from "../chat/chat";
import { IChatRegistryListener } from "./i-chat-registry-listener";

/**
 * Keeps track of all the chats.
 */
export interface IChatRegistry {

  readonly chats: Map<number, Chat>;

  /**
   * Re-maps the chat mapped to the supplied oldId to the specified newId.
   */
  setChatId(oldId: number, newId: number): void;

  /**
   * Gets the chat with the supplied id, otherwise creates and returns a new one.
   */
  getOrCreateChat(id: number): Chat;

  /**
   * Removes the chat with the supplied id.
   */
  removeChat(id: number): Chat | null;

  /**
   * Fills this registry with data parsed directly from JSON.
   */
  loadFromJSON(literals: BasicChat[]): void;

  /**
   * Subscribes to this chat registry to receive updates.
   */
  subscribe(subscriber: IChatRegistryListener): void;
}
