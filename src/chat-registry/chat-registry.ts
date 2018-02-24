import { BasicChat } from "../chat/basic-chat";
import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { DankTime } from "../dank-time/dank-time";
import { IUtil } from "../util/i-util";
import { IChatRegistry } from "./i-chat-registry";
import { IChatRegistryListener } from "./i-chat-registry-listener";
import { AbstractPlugin } from "../plugin-host/plugin/plugin";
import { PluginHost } from "../plugin-host/plugin-host";

/**
 * Keeps track of all the chats.
 */
export class ChatRegistry implements IChatRegistry {

  private readonly listeners: IChatRegistryListener[] = [];

  constructor(
    private readonly moment: any,
    private readonly util: IUtil,
    private readonly availablePlugins: AbstractPlugin[],
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
    const chat = new Chat(this.moment, this.util, id, new PluginHost(this.availablePlugins));

    // These default dank times should be moved to a configurable .json file at some point.
    chat.addDankTime(new DankTime(0, 0, ["0000"], 5));
    chat.addDankTime(new DankTime(4, 20, ["420"], 15));
    chat.addDankTime(new DankTime(11, 11, ["1111"], 5));
    chat.addDankTime(new DankTime(12, 34, ["1234"], 5));
    chat.addDankTime(new DankTime(13, 37, ["1337"], 10));
    chat.addDankTime(new DankTime(16, 20, ["420"], 10));
    chat.addDankTime(new DankTime(22, 22, ["2222"], 5));

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

    // For backwards compatibility with previous versions.
    if (!literal.multiplier) {
      literal.multiplier = 2;
    }
    if (!literal.autoLeaderboards) {
      literal.autoLeaderboards = true;
    }
    if (!literal.firstNotifications) {
      literal.firstNotifications = true;
    }
    if (!literal.handicaps) {
      literal.handicaps = true;
    }

    const dankTimes = new Array<DankTime>();
    literal.dankTimes.forEach((dankTime) => dankTimes.push(DankTime.fromJSON(dankTime)));

    const users = new Map();
    literal.users.forEach((user) => {
      user.score = Math.max(0, user.score); // For backwards compatibility with previous versions
      users.set(user.id, User.fromJSON(user));
    });

    return new Chat(this.moment, this.util, literal.id, new PluginHost(this.availablePlugins), literal.timezone, literal.running, literal.numberOfRandomTimes,
      literal.pointsPerRandomTime, literal.lastHour, literal.lastMinute, users, dankTimes, [],
      literal.notifications, literal.multiplier, literal.autoLeaderboards, literal.firstNotifications,
      literal.hardcoreMode);
  }
}
