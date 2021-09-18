import { PluginEventArguments } from "./plugin-event-arguments";
import { PluginEvent } from "./plugin-event-types";

/**
 * Contains all fields necessary for a plugin to subscribe to a plugin event.
 */
export class PluginEventSubscription {

    public static readonly ANY_SOURCE_OR_REASON = "*";

    constructor(
        /**
         * Function that handles the event when received.
         */
        public readonly handler: (eventArgs: PluginEventArguments) => void,

        /**
         * The type of event to filter on.
         */
        public readonly event: PluginEvent,

        /**
         * The name of the plugin to accept these events from, or empty if wanting to accept events from DankTimesBot,
         * or star (*) to accept these events from any source. Star by default.
         */
        public readonly nameOfOriginPlugin = PluginEventSubscription.ANY_SOURCE_OR_REASON,

        /**
         * The reason to accept these events for, or star (*) to accept these events for any reason. Star by default.
         */
        public readonly reason = PluginEventSubscription.ANY_SOURCE_OR_REASON) { }
}
