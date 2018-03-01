import { assert } from "chai";
import "mocha";
import * as moment from "moment-timezone";
import {
  DankTimesBotControllerMock,
} from "../danktimesbot-controller/danktimesbot-controller-mock";
import { Util } from "../util/util";
import { ChatRegistry } from "./chat-registry";

const util = new Util();

describe("ChatRegistry.constructor", () => {
  const instance = new ChatRegistry(moment, util, []);

  it("should have created a new instance...", () => {
    assert.deepEqual(instance.chats.size, 0);
  });
});

describe("ChatRegistry.getOrCreateChat", () => {

  it("Should create a new chat if the supplied id is unknown", () => {

    // Arrange
    const instance = new ChatRegistry(moment, util, []);
    const dankController = new DankTimesBotControllerMock();
    instance.subscribe(dankController);
    assert.equal(instance.chats.size, 0);
    assert.equal(instance.chats.get(0), undefined);

    // Act
    instance.getOrCreateChat(0);

    // Assert
    assert.equal(instance.chats.size, 1);
    const created = instance.chats.get(0);
    assert.isDefined(created);
    assert.isNotNull(created);
    assert.equal(dankController.onChatCreatedCalledWith, created);
  });
});
