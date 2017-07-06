'use strict';

/**
 * Holds data about a release.
 */
class Release {

  /**
   * Constructs a new release.
   * @param {string} version The version, e.g. '1.1.0'.
   * @param {string} date The release date in readable format, e.g. 'June 7th, 2017'.
   * @param {string[]} changes The changes, which is an array of descriptions.
   */
  constructor(version, date, changes) {
    this.version = version;
    this.date = date;
    this.changes = changes;
  }
}

// Exports.
module.exports = Release;