import { assert } from "chai";
import "mocha";
import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { Validation } from "./validation";

function testValidator(newValue: number, oldValue: number): Validation {
  if (newValue > 6) {
    return { succes: true, message: "successMessage" };
  }
  return { succes: false, message: "errorMessage" };
}

const template = new ChatSettingTemplate("newsetting", "newdescription", 10, testValidator);

describe("ChatSetting.constructor and ChatSetting.value", () => {

  it("Should instantiate an instance with the supplied starting value.", () => {
    const setting = new ChatSetting(template, 8);
    assert.equal(setting.value, 8);
  });

  it("Should instantiate an instance with the default value if no starting value is supplied", () => {
    const setting = new ChatSetting(template);
    assert.equal(setting.value, template.defaultValue);
  });

  it("Should throw an error if the starting value fails validation.", () => {
    assert.throws(() => new ChatSetting(template, 6), "errorMessage");
  });
});

describe("ChatSetting.trySetValue", () => {

  it("Should succeed validation and set the value.", () => {
    const setting = new ChatSetting(template, 8);
    const validation = setting.trySet(12);
    assert.isTrue(validation.succes);
    assert.equal(validation.message, "successMessage");
    assert.equal(setting.value, 12);
  });

  it("Should fail validation and not set the value", () => {
    const setting = new ChatSetting(template, 8);
    const validation = setting.trySet(6);
    assert.isFalse(validation.succes);
    assert.equal(validation.message, "errorMessage");
    assert.equal(setting.value, 8);
  });
});
