import { Release } from "../misc/release";

export interface IUtil {

  /**
   * Removes from the text the characters with unicodes 65039 and 8419.
   * Makes it so the emoji versions of numbers are parsed to just normal numbers.
   * @param text The text to clean.
   * @return The cleaned text.
   */
  cleanText(text: string): string;

  /**
   * Converts a map to a sorted array, using the specified comparator.
   */
  mapToSortedArray<T>(map: Map<any, T>, comparator: ((a: T, b: T) => number)): T[];

  /**
   * Prepends any arbitrary string with a 0 and extracts the last two characters which are then returned.
   * "0"   => "00"
   * "1"   => "01"
   * "12"  => "12"
   * "122" => "22"
   * @param theNumber The number to prepend 0 to.
   */
  padNumber(theNumber: string | number): string;

  /**
   * Takes an array of releases and gets the 'What's New?' message of the first entry.
   * If the array is empty, returns a default error message.
   */
  releaseLogToWhatsNewMessage(releaseLog: Release[]): string;
}
