import { assert } from "chai";
import "mocha";
import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { ChatSettings } from "./chat-settings";
import { Validation } from "./validation";

function testValidator(newValue: number, oldValue: number): Validation {
  if (newValue > 6) {
    return { succes: true, message: "successMessage" };
  }
  return { succes: false, message: "errorMessage" };
}

const settingName = "newsetting";
const templates = [new ChatSettingTemplate(settingName, "newdescription", 10, testValidator)];

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
});

describe("ChatSettings.trySet", () => {

  it("Should fail if the setting is unknown.", () => {
    const settings = new ChatSettings(undefined, templates);
    const validation = settings.trySet("randomgibberish", true);
    assert.isFalse(validation.succes);
  });

  it("Should fail if the type of the setting does not equal the supplied value's type", () => {
    const settings = new ChatSettings(undefined, templates);
    const validation = settings.trySet(settingName, "20");
    assert.isFalse(validation.succes);
    assert.equal((settings.settings.get(settingName) as ChatSetting<any>).value, templates[0].defaultValue);
  });
});
