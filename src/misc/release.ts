/**
 * Holds data about a release.
 */
export class Release {

    /**
   * Constructs a new release.
   * @param version The version, e.g. '1.1.0'.
   * @param date The release date in readable format, e.g. 'June 7th, 2017'.
   * @param changes The changes, which is an array of descriptions.
   */
    constructor(
    public readonly version: string,
    public readonly date: string,
    public readonly changes: string[]) { }

    /**
   * Gets this release's data as a neatly formatted 'What's New?' string message.
   */
    public getWhatsNewMessage(): string {
        let message = `<b>🗒️ What's new in version ${this.version} ?</b>\n\n`;
        this.changes.forEach((change) => {
            message += `- ${change}\n`;
        });
        return message;
    }
}
