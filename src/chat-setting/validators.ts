import { Validation } from "./validation";

// This file contains all the validators used by ChatSettingTemplates.

export function dailyRandomFrequency(newValue: number, currentValue: number): Validation {
  if (newValue < 0 || newValue > 24) {
    return { success: false, message: "The frequency must be a whole number between 0 and 24!" };
  }
  return { success: true, message: "Updated the daily frequency of random dank times!" };
}

export function modifier(newValue: number, currentValue: number): Validation {
  if (newValue < 1 || newValue > 10) {
    return { success: false, message: "The multiplier must be a number between 1 and 10!" };
  }
  return { success: true, message: "Updated the multiplier!" };
}

export function pointsPerRandomTime(newValue: number, currentValue: number): Validation {
  if (newValue < 1 || newValue > 100) {
    return { success: false, message: "The points must be a whole number between 1 and 100!" };
  }
  return { success: true, message: "Updated the points for random dank times!" };
}

export function running(newValue: boolean, currentValue: boolean): Validation {
  if (newValue === currentValue) {
    const errorMsg = newValue ? "The bot is already running!" : "The bot is already stopped!";
    return { success: false, message: errorMsg };
  }
  const successMsg = newValue ? "The bot is now running! Hit '/help' for available commands."
    : "The bot is now stopped! Hit '/set running true' to restart.";
  return { success: true, message: successMsg };
}

export function timezone(newValue: string, currentValue: string): Validation {
  return { success: true, message: "Updated the time zone!" };
}
