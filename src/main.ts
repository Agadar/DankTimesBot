// Suppress promise warning from node-telegram-bot-api (https://github.com/yagop/node-telegram-bot-api/issues/319)
process.env.NTBA_FIX_319 = "1";

import { ContextRoot } from "./context-root";
import { Server } from "./server";

const contextRoot = new ContextRoot();
const server = new Server(contextRoot);

server.run();
