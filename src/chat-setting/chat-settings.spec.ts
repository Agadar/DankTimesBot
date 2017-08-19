import { assert } from "chai";
import "mocha";
import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { ChatSettings } from "./chat-settings";
import * as coercers from "./coercers";
import { Validation } from "./validation";

function testValidator(newValue: number, oldValue: number): Validation {
  if (newValue > 6) {
    return { succes: true, message: "successMessage" };
  }
  return { succes: false, message: "errorMessage" };
}

const settingName = "newsetting";
const templates = [new ChatSettingTemplate(settingName, "newdescription", 10, testValidator, coercers.toWholeNumber)];

describe("ChatSettings.constructor", () => {

  it("Should instantiate an instance with default values if no literal supplied.", () => {
    const settings = new ChatSettings(undefined, templates);
    let newsetting = settings.settings.get(settingName);
    assert.isFalse(newsetting === undefined);
    newsetting = newsetting as ChatSetting<any>;
    assert.equal(newsetting.value, templates[0].defaultValue);
  });

  it("Should instantiate an instance with default values if empty literal supplied.", () => {
    const settings = new ChatSettings({}, templates);
    let newsetting = settings.settings.get(settingName);
    assert.isFalse(newsetting === undefined);
    newsetting = newsetting as ChatSetting<any>;
    assert.equal(newsetting.value, templates[0].defaultValue);
  });

  it("Should instantiate an instance with the values in the literal", () => {
    const settings = new ChatSettings({ newsetting: 20 }, templates);
    let newsetting = settings.settings.get(settingName);
    assert.isFalse(newsetting === undefined);
    newsetting = newsetting as ChatSetting<any>;
    assert.equal(newsetting.value, 20);
  });

  it("Should instantiate an instance with default values if the literal values are invalid", () => {
    const settings = new ChatSettings({ newsetting: "twenty" }, templates);
    let newsetting = settings.settings.get(settingName);
    assert.isFalse(newsetting === undefined);
    newsetting = newsetting as ChatSetting<any>;
    assert.equal(newsetting.value, templates[0].defaultValue);
  });
});

describe("ChatSettings.trySet", () => {

  it("Should fail if the setting is unknown.", () => {
    const settings = new ChatSettings(undefined, templates);
    const validation = settings.trySetFromString("randomgibberish", "20");
    assert.isFalse(validation.succes);
    assert.equal((settings.settings.get(settingName) as ChatSetting<any>).value, templates[0].defaultValue);
  });

  it("Should fail if the type of the setting does not equal the supplied value's type", () => {
    const settings = new ChatSettings(undefined, templates);
    const validation = settings.trySetFromString(settingName, "twenty");
    assert.isFalse(validation.succes);
    assert.equal((settings.settings.get(settingName) as ChatSetting<any>).value, templates[0].defaultValue);
  });

  it("Should fail if the setting is supplied an invalid value", () => {
    const settings = new ChatSettings(undefined, templates);
    const validation = settings.trySetFromString(settingName, "5");
    assert.isFalse(validation.succes);
    assert.equal((settings.settings.get(settingName) as ChatSetting<any>).value, templates[0].defaultValue);
  });

  it("Should succeed if the setting is found and the supplied value is wholly valid", () => {
    const settings = new ChatSettings(undefined, templates);
    const validation = settings.trySetFromString(settingName, "8");
    assert.isTrue(validation.succes);
    assert.equal((settings.settings.get(settingName) as ChatSetting<any>).value, 8);
  });
});

describe("ChatSettings.toJSON", () => {

  it("Should correctly print all .", () => {
    const settings = new ChatSettings(undefined, templates);
    const obj = settings.toJSON();
    assert.isTrue(obj[settingName] !== undefined);
    assert.equal(obj[settingName], (settings.settings.get(settingName) as ChatSetting<any>).value);
  });
});
