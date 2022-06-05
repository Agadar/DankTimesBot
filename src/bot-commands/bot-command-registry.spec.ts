import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import * as moment from "moment-timezone";
import TelegramBot from "node-telegram-bot-api";
import { ChatRegistryMock } from "../chat-registry/chat-registry-mock";
import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { Chat } from "../chat/chat";
import { User } from "../chat/user/user";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { TelegramClientMock } from "../telegram-client/telegram-client-mock";
import { BotCommand } from "./bot-command";
import { BotCommandRegistry } from "./bot-command-registry";

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("BotCommandRegistry #executeCommand and #registerCommand", () => {

    const expectedCommandCalledText = "Called!";

    const nonAdmincommandObject = {
        commandFunction: (chat: Chat, user: User, msg0: TelegramBot.Message, match: string) => {
            nonAdminCommandCalled = true;
            return expectedCommandCalledText;
        },
    };
    const admincommandObject = {
        commandFunction: (chat: Chat, user: User, msg0: TelegramBot.Message, match: string) => {
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
    let msg: TelegramBot.Message = {
        chat: {
            id: 0,
            type: "private",
        },
        date: moment.now() / 1000,
        from: {
            first_name: "Agadar",
            id: 0,
            is_bot: false,
        },
        message_id: 0,
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
                type: "group",
            },
            date: moment.now() / 1000,
            from: {
                first_name: "Agadar",
                id: 0,
                is_bot: false,
            },
            message_id: 0,
        };
        botCommandRegistry = new BotCommandRegistry(telegramClientMock, chatRegistry);
    });

    it("#registerCommand should register a command", async () => {
        // Act
        await botCommandRegistry.registerCommand(nonAdminCommand);
    });

    it("#registerCommand should throw an error if a command already exists with the same name(s)", async () => {
        // Arrange
        const otherCommand = new BotCommand(["testcommand"], "description",
            nonAdmincommandObject.commandFunction, true, false);

        // Act & Assert
        await botCommandRegistry.registerCommand(nonAdminCommand);
        await chai.assert.isRejected(botCommandRegistry.registerCommand(otherCommand));
    });

    it("#registerCommand should throw an error if a command already exists with the same name(s) case-insensitively (1)", async () => {
        // Arrange
        const otherCommand = new BotCommand(["TestCommand"], "description",
            nonAdmincommandObject.commandFunction, true, false);

        // Act & Assert
        await botCommandRegistry.registerCommand(nonAdminCommand);
        await chai.assert.isRejected(botCommandRegistry.registerCommand(otherCommand));
    });

    it("#registerCommand should throw an error if a command already exists with the same name(s) case-insensitively (2)", async () => {
        // Arrange
        const otherCommand = new BotCommand(["TestCommand"], "description",
            nonAdmincommandObject.commandFunction, true, false);

        // Act & Assert
        await botCommandRegistry.registerCommand(otherCommand);
        await chai.assert.isRejected(botCommandRegistry.registerCommand(nonAdminCommand));
    });

    it("#executeCommand should execute a non-admin-only command as a non-admin", async () => {
        // Arrange
        (msg.from as TelegramBot.User).id = 1;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, null, nonAdminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(nonAdminCommandCalled);
    });

    it("#executeCommand should execute a non-admin-only command as an admin", async () => {
        // Arrange
        (msg.from as TelegramBot.User).id = 0;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, null, nonAdminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(nonAdminCommandCalled);
    });

    it("#executeCommand should NOT execute an admin-only command as a non-admin", async () => {
        // Arrange
        (msg.from as TelegramBot.User).id = 1;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, null, adminCommand);

        // Assert
        assert.equal(reply, expectedAdminOnlyWarning);
        assert.isFalse(adminCommandCalled);
    });

    it("#executeCommand should execute an admin-only command as an admin", async () => {
        // Arrange
        (msg.from as TelegramBot.User).id = 0;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, null, adminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(adminCommandCalled);
    });

    it("#executeCommand should execute an admin-only command as a non-admin in a private chat", async () => {
        // Arrange
        (msg.from as TelegramBot.User).id = 1;
        msg.chat.type = "private";

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, null, adminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(adminCommandCalled);
    });

    it("#executeCommand should execute an admin-only command as a non-admin that is the developer", async () => {
        // Arrange
        (msg.from as TelegramBot.User).id = 100805902;

        // Act
        const reply = await botCommandRegistry.executeCommand(msg, null, adminCommand);

        // Assert
        assert.equal(reply, expectedCommandCalledText);
        assert.isTrue(adminCommandCalled);
    });
});
