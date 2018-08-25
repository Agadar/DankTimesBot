// Suppress promise warning from node-telegram-bot-api (https://github.com/yagop/node-telegram-bot-api/issues/319)
process.env.NTBA_FIX_319 = "1";

import * as contextRoot from "./context-root";
import { Server } from "./server";

const server = new Server(
  contextRoot.util,
  contextRoot.fileIO,
  contextRoot.chatRegistry,
  contextRoot.releaseLog,
  contextRoot.telegramClient,
  contextRoot.dankTimeScheduler,
  contextRoot.config,
  contextRoot.nodeCleanup,
  contextRoot.cronJob,
  contextRoot.version,
  contextRoot.danktimesbotController,
  contextRoot.chatSettingsRegistry,
  contextRoot.pluginHost,
);

server.run();
