import * as chai from "chai";
const assert = chai.assert;
import "mocha";

import * as moment from "moment-timezone";
import { ChatRegistryMock } from "../chat-registry/chat-registry-mock";
import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { TelegramClientMock } from "../telegram-client/telegram-client-mock";
import { BotCommand } from "./bot-command";
import { BotCommandRegistry } from "./bot-command-registry";

describe("BotCommandRegistry #executeCommand", () => {

    const expectedCommandCalledText = "Called!";

    const nonAdmincommandObject = {
        commandFunction: (chat: Chat, user: User, msg0: any, match: string[]) => {
            nonAdminCommandCalled = true;
            return expectedCommandCalledText;
        },
    };
    const admincommandObject = {
        commandFunction: (chat: Chat, user: User, msg0: any, match: string[]) => {
            adminCommandCalled = true;
            return expectedCommandCalledText;
        },
    };

    const nonAdminCommand = new BotCommand(["testcommand"], "description",
        nonAdmincommandObject.commandFunction, true, false);
    const adminCommand = new BotCommand(["testcommand"], "description",
        admincommandObject.commandFunction, true, true);
    const expectedAdminOnlyWarning = "🚫 This option is only available to admins!";

    const chatMock = {
        getOrCreateUser: (userId: number, userName = "anonymous"): User => {
            return new User(userId, userName);
        },
    } as Chat;
    let telegramClientMock: ITelegramClient;
    let chatRegistry: IChatRegistry;
    let nonAdminCommandCalled: boolean;
    let adminCommandCalled: boolean;
    let msg = {
        chat: {
            id: 0,
            type: "private",
        },
        from: {
            id: 0,
        },
    };

    let botCommandRegistry: BotCommandRegistry;

    beforeEach("Set up test variables", () => {
        chatRegistry = new ChatRegistryMock();
        chatRegistry.chats.set(0, chatMock);
        telegramClientMock = new TelegramClientMock();
        nonAdminCommandCalled = false;
        adminCommandCalled = false;
        msg = {
            chat: {
                id: 0,
                type: "public",
            },
            from: {
                id: 0,
            },
        };
        botCommandRegistry = new BotCommandRegistry(telegramClientMock, chatRegistry);
    });

    it("should execute a non-admin-only command as a non-admin", async () => {
        // Arrange
        msg.from.id = 1;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, [], nonAdminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(nonAdminCommandCalled);
    });

    it("should execute a non-admin-only command as an admin", async () => {
        // Arrange
        msg.from.id = 0;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, [], nonAdminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(nonAdminCommandCalled);
    });

    it("should NOT execute an admin-only command as a non-admin", async () => {
        // Arrange
        msg.from.id = 1;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, [], adminCommand);

        // Assert
        assert.equal(reply, expectedAdminOnlyWarning);
        assert.isFalse(adminCommandCalled);
    });

    it("should execute an admin-only command as an admin", async () => {
        // Arrange
        msg.from.id = 0;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, [], adminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(adminCommandCalled);
    });

    it("should execute an admin-only command as a non-admin in a private chat", async () => {
        // Arrange
        msg.from.id = 1;
        msg.chat.type = "private";

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, [], adminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(adminCommandCalled);
    });

    it("should execute an admin-only command as a non-admin that is the developer", async () => {
        // Arrange
        msg.from.id = 100805902;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, [], adminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(adminCommandCalled);
    });
});
