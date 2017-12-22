import { BasicChat } from "../chat/basic-chat";
import { Chat } from "../chat/chat";
import { IChatRegistry } from "./i-chat-registry";

export class ChatRegistryMock implements IChatRegistry {

  public chats = new Map<number, Chat>();

  public setChatId(oldId: number, newId: number): void {
    /**/
  }

  public getOrCreateChat(id: number): Chat {
    return this.chats.get(id) as Chat;
  }

  public loadFromJSON(literals: BasicChat[]): void {
    /**/
  }
}
