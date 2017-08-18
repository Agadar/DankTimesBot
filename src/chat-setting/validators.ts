import { Validation } from "./validation";

// This file contains all the validators used by ChatSettingTemplates.

export function running(newValue: boolean, currentValue: boolean): Validation {
  if (newValue === currentValue) {
    const errorMsg = newValue ? "The bot is already running!" : "The bot is already stopped!";
    return { succes: false, message: errorMsg };
  }
  const successMsg = newValue ? "The bot is now running! Hit '/help' for available commands."
    : "The bot is now stopped! Hit '/set running true' to restart.";
  return { succes: true, message: successMsg };
}
