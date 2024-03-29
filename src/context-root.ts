import nodeCleanupImport from "node-cleanup";
import TelegramBot from "node-telegram-bot-api";

import { BotCommandRegistry } from "./bot-commands/bot-command-registry";
import { DankTimesBotCommands } from "./bot-commands/commands/danktimesbot-commands";
import { DankTimesBotCommandsRegistrar } from "./bot-commands/registrar/danktimesbot-commands-registrar";
import { ChatRegistry } from "./chat-registry/chat-registry";
import { IChatRegistry } from "./chat-registry/i-chat-registry";
import { BasicChat } from "./chat/basic-chat";
import { ChatSettingsRegistry } from "./chat/settings/chat-settings-registry";
import { DankTimeScheduler } from "./dank-time-scheduler/dank-time-scheduler";
import { IDankTimeScheduler } from "./dank-time-scheduler/i-dank-time-scheduler";
import { DankTimesBotController } from "./danktimesbot-controller/danktimesbot-controller";
import { IDankTimesBotController } from "./danktimesbot-controller/i-danktimesbot-controller";
import { Config } from "./misc/config";
import { Release } from "./misc/release";
import { PluginHost } from "./plugin-host/plugin-host";
import { ITelegramClient } from "./telegram-client/i-telegram-client";
import { TelegramClient } from "./telegram-client/telegram-client";
import { FileIO } from "./util/file-io/file-io";
import { IUtil } from "./util/i-util";
import { Util } from "./util/util";

/**
 * The context root for the entire application. Initializes all components
 * used within this application, and exposes them.
 */
export class ContextRoot {

    public readonly fileIO: FileIO;
    public readonly config: Config;
    public readonly chatSettingsRegistry: ChatSettingsRegistry;
    public readonly pluginHost: PluginHost;
    public readonly util: IUtil;
    public readonly chatRegistry: IChatRegistry;
    public readonly telegramClient: ITelegramClient;
    public readonly dankTimeScheduler: IDankTimeScheduler;
    public readonly version: string;
    public readonly releaseLog: Release[];
    public readonly danktimesbotController: IDankTimesBotController;
    public readonly nodeCleanup: any;

    public readonly backupFile = "backup.json";

    public constructor() {

        // Prepare file IO, and load configurations.
        this.fileIO = new FileIO();
        this.config = this.fileIO.loadConfigFromFile();

        // Initialise Telegram Bot API client
        const telegramBot = new TelegramBot(this.config.apiKey, { polling: true });
        this.telegramClient = new TelegramClient(telegramBot);

        // Load and initialize plugins.
        const availablePlugins = this.fileIO.GetAvailablePlugins(this.config.plugins);
        availablePlugins.forEach((plugin) => plugin.setTelegramBotClient(telegramBot));
        this.pluginHost = new PluginHost(availablePlugins);
        this.chatSettingsRegistry = new ChatSettingsRegistry();
        this.pluginHost.registerPluginSettings(this.chatSettingsRegistry);

        // Load and initialize chats.
        this.util = new Util();
        this.chatRegistry = new ChatRegistry(this.util, this.chatSettingsRegistry, this.pluginHost);
        const initialChats = this.fileIO.loadDataFromFile<BasicChat[]>(this.backupFile) ?? [];
        this.chatRegistry.loadFromJSON(initialChats);

        // Prepare scheduler for sending messages.
        this.dankTimeScheduler = new DankTimeScheduler(this.telegramClient, this.pluginHost);

        // Load and initialize commands.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        this.version = require("../package.json").version;
        this.releaseLog = this.fileIO.loadReleaseLogFromFile();
        const botCommandsRegistry = new BotCommandRegistry(this.telegramClient, this.chatRegistry);
        const dankTimesBotCommands = new DankTimesBotCommands(
            botCommandsRegistry, this.dankTimeScheduler, this.util, this.releaseLog);
        const dankTimesBotCommandsRegistrar = new DankTimesBotCommandsRegistrar(botCommandsRegistry, this.telegramClient,
            this.chatRegistry, dankTimesBotCommands);
        dankTimesBotCommandsRegistrar.registerDankTimesBotCommands();
        this.pluginHost.registerPluginCommands(botCommandsRegistry);

        // Miscellaneous initializations and exports.
        this.danktimesbotController = new DankTimesBotController(this.chatRegistry,
            this.dankTimeScheduler, this.telegramClient, this.pluginHost, this.fileIO, this.util);
        this.nodeCleanup = nodeCleanupImport;
    }
}
