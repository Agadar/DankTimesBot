import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate, Validation } from "./chat-setting-template";

export class ChatSettingHelper {

  private readonly templates: Array<ChatSettingTemplate<any>> = [
    new ChatSettingTemplate("running", "Whether the bot is running", false, this.runningValidator),
  ];

  public generateSettings(): Array<ChatSetting<any>> {
    return [];
  }

  private runningValidator(newValue: boolean, currentValue: boolean): Validation {
    if (newValue === currentValue) {
      const errorMsg = newValue ? "The bot is already running!" : "The bot is already stopped!";
      return { succes: false, message: errorMsg };
    }
    const successMsg = newValue ? "The bot is now running! Hit '/help' for available commands."
      : "The bot is now stopped! Hit '/set running true' to restart.";
    return { succes: true, message: successMsg };
  }
}
