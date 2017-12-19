import { CronJob } from "cron";
import * as fs from "fs";
import * as momentImport from "moment-timezone";
import nodeCleanupImport = require("node-cleanup");
import TelegramBot = require("node-telegram-bot-api");

import { ChatRegistry } from "./chat/chat-registry";
import { DankTimeScheduler } from "./dank-time-scheduler/dank-time-scheduler";
import { TelegramBotCommands } from "./telegram-bot-command/telegram-bot-commands";
import { TelegramClient } from "./telegram-client/telegram-client";
import { FileIO } from "./util/file-io/file-io";
import { Util } from "./util/util";

export const fileIO = new FileIO(fs);
export const chatRegistry = new ChatRegistry();

export const config = fileIO.loadConfigFromFile();

const telegramBot = new TelegramBot(config.apiKey, { polling: true });
const util = new Util();

export const telegramClient = new TelegramClient(telegramBot);
export const dankTimeScheduler = new DankTimeScheduler(telegramClient, CronJob);
export const telegramBotCommands = new TelegramBotCommands(telegramClient, chatRegistry, dankTimeScheduler, util);
export const cronJob = CronJob;
export const moment = momentImport;
export const nodeCleanup = nodeCleanupImport;

const initialChats = fileIO.loadChatsFromFile();
chatRegistry.setInitialChats(initialChats);
