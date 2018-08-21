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
import { TelegramClient } from "./telegram-client/telegram-client";
import { FileIO } from "./util/file-io/file-io";
import { Util } from "./util/util";

// tslint:disable-next-line:no-var-requires
export const version = require("../package.json").version;

export const fileIO = new FileIO(fs);

export const util = new Util();

export const config = fileIO.loadConfigFromFile();

export const availablePlugins = fileIO.GetAvailablePlugins(config.plugins);
const initialChats = fileIO.loadChatsFromFile();

export const chatSettingsRegistry = new ChatSettingsRegistry(momentImport);

export const chatRegistry = new ChatRegistry(momentImport, util, chatSettingsRegistry, availablePlugins);
chatRegistry.loadFromJSON(initialChats);

export const releaseLog = fileIO.loadReleaseLogFromFile();

const telegramBot = new TelegramBot(config.apiKey, { polling: true });

export const telegramClient = new TelegramClient(telegramBot);

export const dankTimeScheduler = new DankTimeScheduler(telegramClient, CronJob);

export const danktimesbotController = new DankTimesBotController(momentImport, chatRegistry,
  dankTimeScheduler, telegramClient);

const dankTimesBotCommands = new DankTimesBotCommands(
  telegramClient, chatRegistry, dankTimeScheduler, util, releaseLog, version);

export const dankTimesBotCommandsRegistrar = new DankTimesBotCommandsRegistrar(
  telegramClient, chatRegistry, dankTimesBotCommands);

export const cronJob = CronJob;
export const moment = momentImport;
export const nodeCleanup = nodeCleanupImport;
