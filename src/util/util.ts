import { Release } from "../misc/release";
import { IUtil } from "./i-util";

export class Util implements IUtil {

    /**
     * Removes from the text the characters with unicodes 65039 and 8419.
     * Makes it so the emoji versions of numbers are parsed to just normal numbers.
     * @param text The text to clean.
     * @return The cleaned text.
     */
    public cleanText(text: string): string {
        let clean = "";
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code !== 65039 && code !== 8419) {
                clean += text[i];
            }
        }
        return clean;
    }

    /**
     * Converts a map to a sorted array, using the specified comparator.
     */
    public mapToSortedArray<T>(map: Map<any, T>, comparator: ((a: T, b: T) => number)): T[] {
        const array = new Array<T>();
        map.forEach((value) => array.push(value));
        array.sort(comparator);
        return array;
    }

    /**
     * Prepends any arbitrary string with a 0 and extracts the last two characters which are then returned.
     * "0"   => "00"
     * "1"   => "01"
     * "12"  => "12"
     * "122" => "22"
     * @param theNumber The number to prepend 0 to.
     */
    public padNumber(theNumber: string | number): string {
        return ("0" + theNumber.toString()).slice(-2);
    }

    public releaseLogToWhatsNewMessage(releaseLog: Release[]): string {
        if (releaseLog && releaseLog.length > 0 && releaseLog[0]) {
            return releaseLog[0].getWhatsNewMessage();
        }
        return "⚠️ Release notes are unavailable!";
    }
}
