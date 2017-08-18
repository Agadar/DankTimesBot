import { ChatSettingTemplate } from "./chat-setting-template";

export class ChatSetting<T> {

  private myValue: T;

  constructor(public readonly template: ChatSettingTemplate<T>, value?: T) {
    if (value) {
      this.value = value;
    } else {
      this.myValue = this.template.defaultValue;
    }
  }

  /**
   * Does the same as the setter further below, but instead of throwing an Error if
   * the new value is invalid, it simply returns the feedback message.
   */
  public setValueAndGetFeedback(value: T): string {
    const validation = this.template.validator(value, this.myValue);
    if (validation.succes) {
      this.myValue = value;
    }
    return validation.message;
  }

  public set value(value: T) {
    const validation = this.template.validator(value, this.myValue);
    if (!validation.succes) {
      throw new Error(validation.message);
    }
    this.myValue = value;
  }

  public get value(): T {
    return this.myValue;
  }
}
