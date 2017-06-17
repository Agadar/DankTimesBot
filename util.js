'use strict';

/**
 * Exposes some utility functions for DankTimesBot.
 */

// Exports.
module.exports.mapToSortedArray = mapToSortedArray;
module.exports.compareUsers = compareUsers;
module.exports.compareDankTimes = compareDankTimes;
module.exports.cleanText = cleanText;
module.exports.padNumber = padNumber;

/**
 * Removes from the text the characters with unicodes 65039 and 8419.
 * Makes it so the emoji versions of numbers are parsed to just normal numbers.
 * @param {string} text The text to clean.
 * @return {string} The cleaned text.
 */
function cleanText(text) {
  let clean = '';

  for(let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code != 65039 && code != 8419) {
      clean += text[i];
    }
  }
  return clean;
}

/**
 * Converts a map to a sorted array, using the specified comparator.
 * @param {Map} map
 * @param {function} comparator
 * @return {any[]}
 */
function mapToSortedArray(map, comparator) {
  const array = [];
  for (const entry of map) {
    array.push(entry[1]);
  }
  array.sort(comparator);
  return array;
}

/**
 * Compares two users, primarily via their scores. Used for sorting collections.
 * @param {User} user1
 * @param {User} user2
 */
function compareUsers(user1, user2) {
  if (user1.score > user2.score) {
    return -1;
  }
  if (user1.score === user2.score) {
    return user1.name <= user2.name ? -1 : 1;
  }
  return 1;
}

/**
 * Compares two dank times, primarily via their hour and minute. Used for sorting collections.
 * @param {DankTime} time1 
 * @param {DankTime} time2 
 */
function compareDankTimes(time1, time2) {
  if (time1.hour < time2.hour) {
    return -1;
  }
  if (time1.hour === time2.hour) {
    if (time1.minute < time2.minute) {
      return -1;
    }
    if (time1.minute === time2.minute) {
      return time1.shoutout > time2.shoutout;
    }
  }
  return 1;
}

/**
 * Prepends any arbitrary string with a 0 and extracts the last two characters which are then returned.
 * "0"   => "00"
 * "1"   => "01"
 * "12"  => "12"
 * "122" => "22"
 * @param {num} Number to prepend 0 to.
 */
function padNumber(num)
{
    return ("0" + num).slice(-2);
}
