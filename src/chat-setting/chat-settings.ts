import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { ChatSettingTemplates } from "./chat-setting-templates";
import { Validation } from "./validation";

/** Represents a single chat's settings. */
export class ChatSettings {

  /** This ChatSetting's settings. */
  public readonly settings = new Map<string, ChatSetting<any>>();

  /**
   * Constructs a new ChatSettings from the supplied literal. Any missing fields
   * in the literal are given the corresponding setting's template's default values. If no literal
   * is supplied, then all settings will have the default values. If any of the fields
   * has an incorrect value, then the corresponding setting's template's default value
   * is used instead.
   * @param literal The parsed JSON object to use the values of.
   * @param templates The setting templates to use.
   */
  constructor(literal?: any, templates = ChatSettingTemplates) {
    if (literal !== undefined) {
      templates.forEach((template) => {
        try {
          this.settings.set(template.name, new ChatSetting(template, literal[template.name]));
        } catch (err) {
          this.settings.set(template.name, new ChatSetting(template, template.defaultValue));
        }
      });
    } else {
      templates.forEach((template) => {
        this.settings.set(template.name, new ChatSetting(template, template.defaultValue));
      });
    }
  }

  /**
   * Attempts to set the value of the setting with the supplied name. Will fail if any
   * of the following are true, otherwise will succeed:
   * - The setting is not known;
   * - The value does not pass the setting's coercer or its validator.
   * @param settingName The name of the setting to set the value of.
   * @param value The value to set the setting to.
   */
  public trySetFromString(settingName: string, value: string): Validation {
    const setting = this.settings.get(settingName);
    if (!setting) {
      return { succes: false, message: "This setting does not exist!" };
    }
    return setting.trySetFromString(value);
  }

  /**
   * Used by JSON.stringify. Returns a literal representation of this.
   */
  public toJSON(): any {
    const json: any = {};
    this.settings.forEach((setting) => {
      json[setting.template.name] = setting.value;
    });
    return json;
  }
}
