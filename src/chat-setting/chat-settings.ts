import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { ChatSettingTemplates } from "./chat-setting-templates";
import { Validation } from "./validation";
import * as validators from "./validators";

/** Represents a single chat's settings. */
export class ChatSettings {

  /** This ChatSetting's settings. */
  public readonly settings = new Map<string, ChatSetting<any>>();

  /**
   * Constructs a new ChatSettings from the supplied literal. Any missing fields
   * in the literal are given the default values in the ChatSettings. If no literal
   * is supplied, then all settings will have the default values.
   * @param literal The parsed JSON object to use the values of.
   * @param templates The setting templates to use.
   * @throws Error if any of the literal values does not pass the corresponding
   * setting's validator.
   *
   * NOTE: Should probably just use default value instead of throwing error.
   */
  constructor(literal?: any, templates = ChatSettingTemplates) {
    templates.forEach((template) => {
      this.settings.set(template.name,
        new ChatSetting(template, literal ? literal[template.name] : template.defaultValue));
    });
  }

  /**
   * Attempts to set the value of the setting with the supplied name. Will fail if any
   * of the following are true, otherwise will succeed:
   * - The setting is not known;
   * - The type of the value does not equal the type of the setting's value;
   * - The value does not pass the setting's validator.
   * @param settingName The name of the setting to set the value of.
   * @param value The value to set the setting to.
   */
  public trySet(settingName: string, value: any): Validation {
    const setting = this.settings.get(settingName);
    if (!setting) {
      return { succes: false, message: "This setting is not known!" };
    }
    if (typeof setting.value !== typeof (value as (typeof setting.value))) {
      return { succes: false, message: `This setting only accepts ${typeof setting.value} values!` };
    }
    return setting.trySet(value);
  }

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): any {
    const json: any = {};
    this.settings.forEach((setting) => {
      json[setting.template.name] = setting.value;
    });
  }
}
