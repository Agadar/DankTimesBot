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
  constructor(public readonly version: string, public readonly date: string, public readonly changes: string[]) { }
}
