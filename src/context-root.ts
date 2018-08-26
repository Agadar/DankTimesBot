import { CronJob } from "cron";
import * as fs from "fs";
import * as momentImport from "moment-timezone";
import nodeCleanupImport = require("node-cleanup");
import TelegramBot = require("node-telegram-bot-api");

import { DankTimesBotCommands } from "./bot-commands/commands/danktimesbot-commands";
import { DankTimesBotCommandsRegistrar } from "./bot-commands/registrar/danktimesbot-commands-registrar";
import { ChatRegistry } from "./chat-registry/chat-registry";
import { ChatSettingsRegistry } from "./chat/settings/chat-settings-registry";
import { DankTimeScheduler } from "./dank-time-scheduler/dank-time-scheduler";
import { DankTimesBotController } from "./danktimesbot-controller/danktimesbot-controller";
import { PluginHost } from "./plugin-host/plugin-host";
import { TelegramClient } from "./telegram-client/telegram-client";
import { FileIO } from "./util/file-io/file-io";
import { Util } from "./util/util";

// Prepare file IO, and load configurations.
export const fileIO = new FileIO(fs);
export const config = fileIO.loadConfigFromFile();

// Load and initialize plugins.
export const availablePlugins = fileIO.GetAvailablePlugins(config.plugins);
export const chatSettingsRegistry = new ChatSettingsRegistry(momentImport);
export const pluginHost = new PluginHost(availablePlugins);
pluginHost.registerPluginSettings(chatSettingsRegistry);

// Load and initialize chats.
export const util = new Util();
export const chatRegistry = new ChatRegistry(momentImport, util, chatSettingsRegistry, pluginHost);
const initialChats = fileIO.loadChatsFromFile();
chatRegistry.loadFromJSON(initialChats);

// Prepare Telegram client and scheduler for sending messages.
const telegramBot = new TelegramBot(config.apiKey, { polling: true });
export const telegramClient = new TelegramClient(telegramBot, chatRegistry);
export const dankTimeScheduler = new DankTimeScheduler(telegramClient, CronJob);

// Load and initialize commands.
// tslint:disable-next-line:no-var-requires
export const version = require("../package.json").version;
export const releaseLog = fileIO.loadReleaseLogFromFile();
const dankTimesBotCommands = new DankTimesBotCommands(telegramClient, dankTimeScheduler, util, releaseLog, version);
const dankTimesBotCommandsRegistrar = new DankTimesBotCommandsRegistrar(telegramClient,
  chatRegistry, dankTimesBotCommands);
dankTimesBotCommandsRegistrar.registerDankTimesBotCommands();
pluginHost.registerPluginCommands(telegramClient);

// Miscellaneous initializations and exports.
export const danktimesbotController = new DankTimesBotController(momentImport, chatRegistry,
  dankTimeScheduler, telegramClient, availablePlugins);
export const cronJob = CronJob;
export const moment = momentImport;
export const nodeCleanup = nodeCleanupImport;
