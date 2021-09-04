import { Moment } from "moment-timezone";
import { ChatSetting } from "./chat-setting";
import { ChatSettingTemplate } from "./chat-setting-template";
import { CoreSettingsNames } from "./core-settings-names";

/** Responsible for registering chat setting templates and providing fresh new chat settings. */
export class ChatSettingsRegistry {

    private readonly templates = new Array<ChatSettingTemplate<any>>();

    /** Constructor. Initializes all core settings templates. */
    constructor(private readonly moment: any) {

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.autoleaderboards,
            "if a leaderboard is auto-posted 1 minute after every dank time",
            true, this.toBoolean.bind(this), this.noValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.firstNotifications,
            "if this chat announces the first user to score",
            true, this.toBoolean.bind(this), this.noValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.handicapsEnabled,
            "if the players with the lowest scores earn more points",
            true, this.toBoolean.bind(this), this.noValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.handicapsBottomFraction,
            "the bottom fraction of players considered handicapped",
            0.25, this.toNumber.bind(this), this.handicapsBottomFractionValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.handicapsMultiplier,
            "the multiplier bonus given to handicapped players",
            1.5, this.toNumber.bind(this), this.multiplierValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.hardcoremodeEnabled,
            "if every day, players are punished if they haven't scored the previous day",
            false, this.toBoolean.bind(this), this.noValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.hardcoremodePunishFraction,
            "the fraction of a players's score subtracted when punished by hardcode mode",
            0.1, this.toNumber.bind(this), this.hardcorePunishFractionValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.firstMultiplier,
            "the multiplier for the score of the first players to score",
            2, this.toNumber.bind(this), this.multiplierValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.normaltimesNotifications,
            "if notifications of normal dank times are sent",
            true, this.toBoolean.bind(this), this.noValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.punishUntimelyDankTime,
            "if players are punished for typing a dank time when it's not the right time",
            true, this.toBoolean.bind(this), this.noValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.randomtimesFrequency,
            "the number of random dank times per day",
            1, this.toNumber.bind(this), this.numberOfRandomTimesValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.randomtimesPoints,
            "the points for random daily dank times",
            10, this.toNumber.bind(this), this.pointsPerRandomTimeValidation.bind(this)));

        this.registerChatSetting(new ChatSettingTemplate(CoreSettingsNames.timezone,
            "this chat's timezone",
            "Europe/Amsterdam", this.toTimezoneString.bind(this), this.noValidation.bind(this)));
    }

    /**
     * Gets a fresh new map of all chat settings.
     */
    public getChatSettings(): Map<string, ChatSetting<any>> {
        const map = new Map<string, ChatSetting<any>>();
        this.templates.forEach((template) => map.set(template.name, new ChatSetting(template)));
        return map;
    }

    /**
     * Registers a new chat setting template. Should only be done BEFORE chats
     * are initialized, or chats that were already initialized won't have the
     * new setting available to them.
     * @param template The template to register.
     */
    public registerChatSetting(template: ChatSettingTemplate<any>) {
        const index = this.templates.findIndex((existing) => existing.name === template.name);
        if (index !== -1) {
            throw new Error("A setting with this name already exists!");
        }
        this.templates.push(template);
    }

    private toBoolean(original: string): boolean {
        original = original.toLowerCase();
        if (original === "true" || original === "yes" || original === "1") {
            return true;
        } else if (original === "false" || original === "no" || original === "0") {
            return false;
        }
        throw new RangeError("The value must be a boolean!");
    }

    private toNumber(original: string): number {
        const asNumber = Number(original);
        if (isNaN(asNumber)) {
            throw new RangeError("The value must be a number!");
        }
        return asNumber;
    }

    private toTimezoneString(original: string): string {
        const momentTimezone = this.moment.tz.zone(original);
        if (momentTimezone === null) {
            throw new RangeError("Invalid timezone! Examples: 'Europe/Amsterdam', 'UTC'.");
        }
        return momentTimezone.name;
    }

    private noValidation(value: any) { /* */ }

    private multiplierValidation(value: number) {
        if (value <= 1 || value > 10) {
            throw new RangeError("The value must be a number between 1 and 10!");
        }
    }

    private numberOfRandomTimesValidation(value: number) {
        if (value < 0 || value > 24 || value % 1 !== 0) {
            throw new RangeError("The value must be a whole number between 0 and 24!");
        }
    }

    private pointsPerRandomTimeValidation(value: number) {
        if (value < 1 || value > 100 || value % 1 !== 0) {
            throw new RangeError("The value must be a whole number between 1 and 100!");
        }
    }

    private handicapsBottomFractionValidation(value: number) {
        if (value <= 0 || value > 0.5) {
            throw new RangeError("The value must be a number between 0 and 0.5!");
        }
    }

    private hardcorePunishFractionValidation(value: number) {
        if (value <= 0 || value > 1) {
            throw new RangeError("The value must be a number between 0 and 1!");
        }
    }
}
