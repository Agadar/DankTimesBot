import { BasicChat } from "../chat/basic-chat";
import { Chat } from "../chat/chat";
import { IChatRegistry } from "./i-chat-registry";
import { IChatRegistryListener } from "./i-chat-registry-listener";

export class ChatRegistryMock implements IChatRegistry {

  public removeChatCalledWithId: number | null = null;

  public chats = new Map<number, Chat>();

  public setChatId(oldId: number, newId: number): void {
    /**/
  }

  public getOrCreateChat(id: number): Chat {
    return this.chats.get(id) as Chat;
  }

  public removeChat(id: number): Chat | null {
    this.removeChatCalledWithId = id;
    return null;
  }

  public loadFromJSON(literals: BasicChat[]): void {
    /**/
  }

  public subscribe(subscriber: IChatRegistryListener): void {
    /**/
  }
}
