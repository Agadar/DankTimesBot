import assert = require("assert");
import "mocha";
import { ChatRegistry } from "./chat-registry";

describe("ChatRegistry.constructor", function() {
  const instance = new ChatRegistry();
  it("should have created a new instance...", function() {
    assert.deepEqual(instance.chats.size, 0);
  });
});

describe("ChatRegistry.getOrCreateChat(id)", function() {
  const instance = new ChatRegistry();
  assert.equal(instance.chats.size, 0);
  assert.equal(instance.chats.get(0), null);
  instance.getOrCreateChat(0);
  assert.equal(instance.chats.size, 1);
  assert.notEqual(instance.chats.get(0), null);
});
