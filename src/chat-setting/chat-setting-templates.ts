import { ChatSettingTemplate } from "./chat-setting-template";
import * as coercers from "./coercers";
import * as validators from "./validators";

// This file contains all ChatSettingTemplates used by ChatSettings to create settings from.

export const ChatSettingTemplates: Array<ChatSettingTemplate<any>> = [
  new ChatSettingTemplate("running", "Whether the bot is running", false, validators.running, coercers.toBoolean),
  // new ChatSettingTemplate("firstnotifications", "")
];
