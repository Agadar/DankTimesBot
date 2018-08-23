import { Chat } from "../../chat/chat";
import { ChatMessage } from "../../chat/chat-message/chat-message";

/**
 * Defines an interface for plugins
 * to register their own custom commands
 * with appropriate callbacks.
 *
 * A Plugin Command must have some additional output.
 */
export class PluginCommand {
  public readonly commandString: string;
  public readonly invoke: (chat: Chat, message: ChatMessage) => string[];

  constructor(command: string, callback: (chat: Chat, message: ChatMessage) => string[]) {
    if (command.length > 0 && command[0] === "/") {
      command = command.slice(1);
    }
    this.commandString = command;
    this.invoke = callback;
  }
}
