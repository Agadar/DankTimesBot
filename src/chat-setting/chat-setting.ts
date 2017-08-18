import { ChatSettingTemplate } from "./chat-setting-template";
import { Validation } from "./validation";

/** Describes a setting of a chat, based on a setting template. */
export class ChatSetting<T> {

  /** This setting's value for a chat. */
  private myValue: T;

  /**
   * Constructs a new setting based on a template and with the supplied value.
   * @param template The template to base this on.
   * @param value A starting value, or the template's default value if undefined.
   * @throws Error if the starting value fails validation.
   */
  constructor(public readonly template: ChatSettingTemplate<T>, value?: T) {
    if (value) {
      this.value = value;
    } else {
      this.myValue = this.template.defaultValue;
    }
  }

  /**
   * Does the same as the setter further below, but instead of throwing an Error if
   * the new value is invalid, it simply returns the Validation object.
   */
  public trySet(value: T): Validation {
    const validation = this.template.validator(value, this.myValue);
    if (validation.succes) {
      this.myValue = value;
    }
    return validation;
  }

  /**
   * Sets this setting's value.
   * @throws Error if the new value failed validation.
   */
  public set value(value: T) {
    const validation = this.template.validator(value, this.myValue);
    if (!validation.succes) {
      throw new Error(validation.message);
    }
    this.myValue = value;
  }

  /**
   * Gets this setting's value.
   */
  public get value(): T {
    return this.myValue;
  }
}
