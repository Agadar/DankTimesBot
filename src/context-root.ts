import { CronJob } from "cron";
import * as fs from "fs";
import * as momentImport from "moment-timezone";
import nodeCleanupImport = require("node-cleanup");
import TelegramBot = require("node-telegram-bot-api");

import { ChatRegistry } from "./chat-registry/chat-registry";
import { DankTimeScheduler } from "./dank-time-scheduler/dank-time-scheduler";
import { TelegramBotCommands } from "./telegram-bot-command/telegram-bot-commands";
import { TelegramClient } from "./telegram-client/telegram-client";
import { FileIO } from "./util/file-io/file-io";
import { Util } from "./util/util";

const version = "1.4.0";

export const fileIO = new FileIO(fs);

const initialChats = fileIO.loadChatsFromFile();

const util = new Util();

export const chatRegistry = new ChatRegistry(momentImport, util);
chatRegistry.loadFromJSON(initialChats);

export const config = fileIO.loadConfigFromFile();
export const releaseLog = fileIO.loadReleaseLogFromFile();

const telegramBot = new TelegramBot(config.apiKey, { polling: true });

export const telegramClient = new TelegramClient(telegramBot);
export const dankTimeScheduler = new DankTimeScheduler(telegramClient, CronJob);
export const telegramBotCommands = new TelegramBotCommands(
  telegramClient, chatRegistry, dankTimeScheduler, util, releaseLog, version);
export const cronJob = CronJob;
export const moment = momentImport;
export const nodeCleanup = nodeCleanupImport;
