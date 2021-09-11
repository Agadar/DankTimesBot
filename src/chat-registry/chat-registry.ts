import { BasicChat } from "../chat/basic-chat";
import { Chat } from "../chat/chat";
import { ChatSetting } from "../chat/settings/chat-setting";
import { ChatSettingsRegistry } from "../chat/settings/chat-settings-registry";
import { User } from "../chat/user/user";
import { DankTime } from "../dank-time/dank-time";
import { PluginHost } from "../plugin-host/plugin-host";
import { IUtil } from "../util/i-util";
import { IChatRegistry } from "./i-chat-registry";
import { IChatRegistryListener } from "./i-chat-registry-listener";

/**
 * Keeps track of all the chats.
 */
export class ChatRegistry implements IChatRegistry {

  private readonly listeners: IChatRegistryListener[] = [];

  constructor(
    private readonly util: IUtil,
    private readonly chatSettingsRegistry: ChatSettingsRegistry,
    private readonly pluginHost: PluginHost,
    public readonly chats = new Map<number, Chat>()) { }

  /**
   * Re-maps the chat mapped to the supplied oldId to the specified newId.
   */
  public setChatId(oldId: number, newId: number): void {
    const chat = this.chats.get(oldId);
    if (!chat) { return; }
    this.chats.delete(oldId);
    chat.id = newId;
    this.chats.set(newId, chat);
  }

  /**
   * Gets the chat with the supplied id, otherwise creates and returns a new one.
   */
  public getOrCreateChat(id: number): Chat {

    if (this.chats.has(id)) {
      return this.chats.get(id) as Chat;
    }

    const settings = this.chatSettingsRegistry.getChatSettings();
    const chat = new Chat(this.util, id, this.pluginHost, settings);

    // These default dank times should be moved to a configurable .json file at some point.
    chat.addDankTime(new DankTime(0, 0, ["0000"], () => 5));
    chat.addDankTime(new DankTime(4, 20, ["420"], () => 15));
    chat.addDankTime(new DankTime(11, 11, ["1111"], () => 5));
    chat.addDankTime(new DankTime(12, 34, ["1234"], () => 5));
    chat.addDankTime(new DankTime(13, 37, ["1337"], () => 10));
    chat.addDankTime(new DankTime(16, 20, ["420"], () => 10));
    chat.addDankTime(new DankTime(22, 22, ["2222"], () => 5));

    chat.generateRandomDankTimes();
    this.chats.set(id, chat);
    this.listeners.forEach((listener) => listener.onChatCreated(chat));
    return chat;
  }

  public removeChat(id: number): Chat | null {
    const chatToRemove = this.chats.get(id);

    if (chatToRemove) {
      this.chats.delete(id);
      return chatToRemove;
    } else {
      return null;
    }
  }

  public loadFromJSON(literals: BasicChat[]): void {
    literals.forEach((chat) => this.chats.set(chat.id, this.fromJSON(chat)));
  }

  public subscribe(subscriber: IChatRegistryListener): void {
    if (this.listeners.indexOf(subscriber) === -1) {
      this.listeners.push(subscriber);
    }
  }

  private fromJSON(literal: BasicChat): Chat {

    const dankTimes = new Array<DankTime>();
    literal.dankTimes.forEach((dankTime) => dankTimes.push(DankTime.fromJSON(dankTime)));

    const users = new Map();
    literal.users.forEach((user) => {
      users.set(user.id, User.fromJSON(user));
    });

    const settings = this.chatSettingsRegistry.getChatSettings();

    if (literal.settings) {
      for (const basicSetting of literal.settings) {
        if (settings.has(basicSetting.name)) {
          const setting = settings.get(basicSetting.name) as ChatSetting<any>;
          setting.value = basicSetting.value;
        }
      }
    }

    return new Chat(this.util, literal.id,
      this.pluginHost, settings, literal.running,
      literal.lastHour, literal.lastMinute, users, dankTimes, [],
    );
  }
}
