import { Chat } from './chat';
import { DankTime } from '../dank-time/dank-time';

/**
 * Keeps track of all the chats.
 */
export class ChatRegistry {

  /**
   * Instantiates a new chat registry.
   * @param chats The initial chats.
   */
  constructor(public readonly chats = new Map<number, Chat>()) { }

  /**
   * Re-maps the chat mapped to the supplied oldId to the specified newId.
   */
  public setChatId(oldId: number, newId: number): void {
    const chat = this.chats.get(oldId);
    if (!chat) { return; }
    this.chats.delete(oldId);
    chat.id = newId;
    this.chats.set(newId, chat);
  };

  /**
   * Gets the chat with the supplied id, otherwise creates and returns a new one.
   */
  public getOrCreateChat(id: number): Chat {
    if (this.chats.has(id)) {
      return this.chats.get(id) as Chat;
    }
    const chat = new Chat(id);
    chat.addDankTime(new DankTime(0, 0, ['0000'], 5));
    chat.addDankTime(new DankTime(4, 20, ['420'], 15));
    chat.addDankTime(new DankTime(11, 11, ['1111'], 5));
    chat.addDankTime(new DankTime(12, 34, ['1234'], 5));
    chat.addDankTime(new DankTime(13, 37, ['1337'], 10));
    chat.addDankTime(new DankTime(16, 20, ['420'], 10));
    chat.addDankTime(new DankTime(22, 22, ['2222'], 5));
    this.chats.set(id, chat);
    return chat;
  };
};
