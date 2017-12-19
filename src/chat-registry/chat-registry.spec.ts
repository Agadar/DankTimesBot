import { assert } from "chai";
import "mocha";
import * as moment from "moment-timezone";
import { Util } from "../util/util";
import { ChatRegistry } from "./chat-registry";

const util = new Util();

describe("ChatRegistry.constructor", () => {
  const instance = new ChatRegistry(moment, util);
  it("should have created a new instance...", () => {
    assert.deepEqual(instance.chats.size, 0);
  });
});

describe("ChatRegistry.getOrCreateChat(id)", () => {
  const instance = new ChatRegistry(moment, util);
  assert.equal(instance.chats.size, 0);
  assert.equal(instance.chats.get(0), null);
  instance.getOrCreateChat(0);
  assert.equal(instance.chats.size, 1);
  assert.notEqual(instance.chats.get(0), null);
});
