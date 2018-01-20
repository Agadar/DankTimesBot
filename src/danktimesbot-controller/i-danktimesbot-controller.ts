import { IChatRegistryListener } from "../chat-registry/i-chat-registry-listener";
import { ITelegramClientListener } from "../telegram-client/i-telegram-client-listener";

/**
 * Listens to events from various services and takes actions accordingly.
 */
export interface IDankTimesBotController extends ITelegramClientListener, IChatRegistryListener {

  /**
   * Does a nightly update, which does the following for all chats:
   * - generates new random dank times;
   * - clears all scheduled notifications and reschedules new ones;
   * - does a hardcore mode check;
   * - removes users with score of zero.
   */
  doNightlyUpdate(): void;
}
