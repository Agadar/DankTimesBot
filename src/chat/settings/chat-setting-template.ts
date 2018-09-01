/** A template for a chat setting. */
export class ChatSettingTemplate<T> {

    /**
     * Constructor.
     * @param name The name of the setting.
     * @param description The description of the setting.
     * @param defaultValue The default value of the setting.
     * @param parse The function that parses a supplied string value to the type
     *              of this setting.
     * @param validate The function that validates any new value for the setting.
     *                 Should throw an exception with an explanatory text if the value is invalid.
     */
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly defaultValue: T,
        public readonly parse: (original: string) => T,
        public readonly validate: (value: T) => void) { }
}
