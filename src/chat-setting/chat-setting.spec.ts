import { assert } from "chai";
import "mocha";
import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { Validation } from "./validation";

function testValidator(newValue: number, oldValue: number): Validation {
  if (newValue > 6) {
    return { success: true, message: "successMessage" };
  }
  return { success: false, message: "errorMessage" };
}

function testCoercer(newValue: string): number | undefined {
  const coerced = Number(newValue);
  if (!Number.isNaN(coerced)) {
    return coerced;
  }
  return undefined;
}

const template = new ChatSettingTemplate("newsetting", "newdescription", 10, testValidator, testCoercer);

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
    assert.throws(() => new ChatSetting(template, 6));
  });

  it("Should instantiate an instance with the supplied starting value as a string.", () => {
    const setting = new ChatSetting(template, "8");
    assert.equal(setting.value, 8);
  });

  it("Should throw an error if the starting value fails coercion.", () => {
    assert.throws(() => new ChatSetting(template, "eight"));
  });
});

describe("ChatSetting.trySetValue", () => {

  it("Should succeed validation and set the value.", () => {
    const setting = new ChatSetting(template, 8);
    const validation = setting.trySetFromString("12");
    assert.isTrue(validation.success);
    assert.equal(validation.message, "successMessage");
    assert.equal(setting.value, 12);
  });

  it("Should fail validation and not set the value", () => {
    const setting = new ChatSetting(template, 8);
    const validation = setting.trySetFromString("6");
    assert.isFalse(validation.success);
    assert.equal(validation.message, "errorMessage");
    assert.equal(setting.value, 8);
  });

  it("Should fail coercion and not set the value", () => {
    const setting = new ChatSetting(template, 8);
    const validation = setting.trySetFromString("twelve");
    assert.isFalse(validation.success);
    assert.equal(setting.value, 8);
  });
});
