import { assert } from "chai";
import "mocha";
import { instance, mock } from "ts-mockito";
import { ChatSettingsRegistry } from "../chat/settings/chat-settings-registry";
import {
  DankTimesBotControllerMock,
} from "../danktimesbot-controller/danktimesbot-controller-mock";
import { PluginHost } from "../plugin-host/plugin-host";
import { Util } from "../util/util";
import { ChatRegistry } from "./chat-registry";

const util = new Util();
const chatSettingsRegistry = new ChatSettingsRegistry();
const pluginHostMock = mock(PluginHost);

describe("ChatRegistry.constructor", () => {
  const chatRegistry = new ChatRegistry(util, chatSettingsRegistry, instance(pluginHostMock));

  it("should have created a new instance...", () => {
    assert.deepEqual(chatRegistry.chats.size, 0);
  });
});

describe("ChatRegistry.getOrCreateChat", () => {

  it("Should create a new chat if the supplied id is unknown", () => {

    // Arrange
    const chatRegistry = new ChatRegistry(util, chatSettingsRegistry, instance(pluginHostMock));
    const dankController = new DankTimesBotControllerMock();
    chatRegistry.subscribe(dankController);
    assert.equal(chatRegistry.chats.size, 0);
    assert.equal(chatRegistry.chats.get(0), undefined);

    // Act
    chatRegistry.getOrCreateChat(0);

    // Assert
    assert.equal(chatRegistry.chats.size, 1);
    const created = chatRegistry.chats.get(0);
    assert.isDefined(created);
    assert.isNotNull(created);
    assert.equal(dankController.onChatCreatedCalledWith, created);
  });
});
