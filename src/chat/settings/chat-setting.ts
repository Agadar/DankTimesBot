import { ChatSettingTemplate } from "./chat-setting-template";

/** A chat setting. */
export class ChatSetting<T> {

    private myvalue: T;

    /**
     * Constructor.
     * @param template The template on which this setting is based.
     * @param value The current value, or the default value from the template if left undefined.
     */
    constructor(private readonly template: ChatSettingTemplate<T>, value: T = template.defaultValue) {
        this.value = value;
    }

    /**
     * This setting's name.
     */
    public get name(): string {
        return this.template.name;
    }

    /**
     * This setting's description.
     */
    public get description(): string {
        return this.template.description;
    }

    /**
     * This setting's current value.
     */
    public get value(): T {
        return this.myvalue;
    }

    public set value(value: T) {
        this.template.validate(value);
        this.myvalue = value;
    }

    /**
     * Sets this setting's value from a string.
     * @param value The value, as a string, to set this setting to.
     */
    public setValueFromString(value: string) {
        const parsedValue = this.template.parse(value);
        this.value = parsedValue;
    }
}
