import { IChatRegistry } from "../chat-registry/i-chat-registry";
import { ITelegramClient } from "../telegram-client/i-telegram-client";
import { AwaitingConfirmationData } from "./awaiting-confirmation-data";
import { BotCommand } from "./bot-command";

/**
 * Responsible for registering and executing bot commands.
 */
export class BotCommandRegistry {

    private readonly commands = new Map<string, BotCommand>();
    private readonly awaitingConfirmationList = new Array<AwaitingConfirmationData>();
    private readonly developerUserId = 100805902;

    constructor(
        private readonly telegramClient: ITelegramClient,
        private readonly moment: any,
        private readonly chatRegistry: IChatRegistry) {

        telegramClient.setOnAnyText((msg) => {

            if (!msg.text) { return []; }
            const split = (msg.text as string).split(" ");
            if (split.length < 1) { return []; }

            const dataIndex = this.awaitingConfirmationList.findIndex(
                (entry) => entry.chat.id === msg.chat.id && entry.user.id === msg.from.id);
            if (dataIndex === -1) { return []; }
            const data = this.awaitingConfirmationList.splice(dataIndex, 1)[0];

            if (split[0].toUpperCase() === "YES") {
                return [data.botCommand.action(data.chat, data.user, data.msg, data.match)];
            }
            return [];
        });
    }

    /**
     * Registers a new command, throwing an error if a command with the same name already exists.
     * @param command The command to register.
     */
    public async registerCommand(command: BotCommand): Promise<void> {

        if (this.commands.has(command.name)) {
            throw new Error(`A command with the name '${command.name}' already exists!`);
        }

        this.commands.set(command.name, command);
        const botUsername = await this.telegramClient.getBotUsername();
        const commandRegex = command.getRegex(botUsername);

        this.telegramClient.setOnRegex(commandRegex, (msg: any, match: string[]) => {
            if (this.moment.tz("UTC").unix() - msg.date < 60) {
                this.executeCommand(msg, match, command)
                    .then(
                        (reply) => {
                            if (reply) {
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
    public async executeCommand(msg: any, match: string[], botCommand: BotCommand): Promise<string> {
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

        const chat = this.chatRegistry.getOrCreateChat(msg.chat.id);
        const user = chat.getOrCreateUser(msg.from.id, msg.from.username);

        if (botCommand.requiresConfirmation) {
            const data = new AwaitingConfirmationData(chat, user, msg, match, botCommand);
            this.awaitingConfirmationList.push(data);
            return "🤔 Are you sure? Type 'yes' to confirm.";
        }
        return botCommand.action(chat, user, msg, match);
    }

    /**
     * The currently registered bot commands.
     */
    public get botCommands(): BotCommand[] {
        return [...this.commands].map(((value) => value[1]));
    }

    private async userIsAllowedToExecuteCommand(msg: any, botCommand: BotCommand): Promise<boolean> {
        if (!botCommand.adminOnly || msg.chat.type === "private" || msg.from.id === this.developerUserId) {
            return true;
        }

        const admins = await this.telegramClient.getChatAdministrators(msg.chat.id);

        for (const admin of admins) {
            if (admin.user.id === msg.from.id) {
                return true;
            }
        }
        return false;
    }
}
