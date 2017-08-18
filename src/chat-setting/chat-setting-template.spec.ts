import { assert } from "chai";
import "mocha";
import { ChatSettingTemplate } from "./chat-setting-template";
import { Validation } from "./validation";

function testValidator(newValue: number, oldValue: number): Validation {
  if (newValue === 5) {
    return { succes: true, message: "successMessage" };
  }
  return { succes: false, message: "errorMessage" };
}

describe("ChatSettingTemplate.constructor", () => {

  it("Should correctly instantiate a new instance.", () => {
    const template = new ChatSettingTemplate("newsetting", "newdescription", 5, testValidator);
  });

  it("Should throw an error if the default value fails validation.", () => {
    assert.throws(() => new ChatSettingTemplate("newsetting", "newdescription", 10, testValidator), "errorMessage");
  });
});
