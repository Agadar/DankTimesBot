import moment from "moment";
import TelegramBot from "node-telegram-bot-api";
import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { AwaitingConfirmationData } from "./awaiting-confirmation-data";
import { BotCommand } from "./bot-command";

/**
 * Responsible for registering and executing bot commands.
 */
export class BotCommandRegistry {

    private readonly commands = new Array<BotCommand>();
    private readonly awaitingConfirmationList = new Array<AwaitingConfirmationData>();
    private readonly developerUserIds = [100805902];

    constructor(
        private readonly telegramClient: ITelegramClient,
        private readonly chatRegistry: IChatRegistry) {

        telegramClient.setOnAnyText((msg) => {

            if (!msg.text) { return []; }
            const split = msg.text.split(" ");
            if (split.length < 1) { return []; }

            const dataIndex = this.awaitingConfirmationList.findIndex(
                (entry) => entry.chat.id === msg.chat.id && entry.user.id === msg.from?.id);
            if (dataIndex === -1) { return []; }
            const data = this.awaitingConfirmationList.splice(dataIndex, 1)[0];
            const upperCased = split[0].toUpperCase();

            if (upperCased === "Y" || upperCased === "YES") {
                return [data.botCommand.action(data.chat, data.user, data.msg, data.params)];
            }
            return [];
        });
    }

    /**
     * Registers a new command, throwing an error if a command with the same name already exists.
     * @param command The command to register.
     */
    public async registerCommand(command: BotCommand): Promise<void> {
        const existingCommandName = this.commands.flatMap((existingCommand) => existingCommand.names)
            .find((existingCommName) => command.names.includes(existingCommName));

        if (existingCommandName) {
            throw new Error(`A command with the name '${existingCommandName}' already exists!`);
        }
        this.commands.push(command);
        const botUsername = await this.telegramClient.getBotUsername();
        const commandRegex = command.getRegex(botUsername);

        this.telegramClient.setOnRegex(commandRegex, (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
            if (moment.now() / 1000 - msg.date < 60) {
                this.executeCommand(msg, match, command).then(
                    (reply) => {
                        if (reply.length > 0) {
                            this.telegramClient.sendMessage(msg.chat.id, reply);
                        }
                    },
                    (reason) => console.error(reason),
                );
            }
        });
    }

    /**
     * Executes the supplied bot command.
     * @param msg Raw message object from the Telegram API.
     * @param match The matched regex.
     * @param botCommand The command to execute.
     */
    public async executeCommand(msg: TelegramBot.Message, match: RegExpExecArray | null, botCommand: BotCommand): Promise<string> {
        let userIsAllowedToExecuteCommand = false;

        try {
            userIsAllowedToExecuteCommand = await this.userIsAllowedToExecuteCommand(msg, botCommand);
        } catch (err) {
            console.error("Failed to retrieve admin list!\n" + err);
            return "⚠️ Failed to retrieve admin list! See server console.";
        }

        if (!userIsAllowedToExecuteCommand) {
            return "🚫 This option is only available to admins!";
        }
        if (!msg.from) {
            return "⚠️ Couldn't identify sender!";
        }

        const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
        const user = chat.getOrCreateUser(msg.from.id, msg.from.username);
        const params = match !== null && match.length > 1 ? match[1] : "";

        if (botCommand.requiresConfirmation) {
            const data = new AwaitingConfirmationData(chat, user, msg, params, botCommand);
            this.awaitingConfirmationList.push(data);
            return botCommand.confirmationText;
        }
        return botCommand.action(chat, user, msg, params);
    }

    /**
     * Gets a list of commands that should be shown in the help output, sorted by primary name.
     */
    public getCommandsForHelpOutput(): BotCommand[] {
        return this.commands.filter((command) => command.showInHelp).sort(BotCommand.compare);
    }

    private async userIsAllowedToExecuteCommand(msg: TelegramBot.Message, botCommand: BotCommand): Promise<boolean> {
        if (!botCommand.adminOnly || msg.chat.type === "private" || (msg.from && this.developerUserIds.includes(msg.from.id))) {
            return true;
        }

        const admins = await this.telegramClient.getChatAdministrators(msg.chat.id);

        for (const admin of admins) {
            if (admin.user.id === msg.from?.id) {
                return true;
            }
        }
        return false;
    }
}
