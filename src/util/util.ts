/**
 * Removes from the text the characters with unicodes 65039 and 8419.
 * Makes it so the emoji versions of numbers are parsed to just normal numbers.
 * @param text The text to clean.
 * @return The cleaned text.
 */
export function cleanText(text: string): string {
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
export function mapToSortedArray<T>(map: Map<any, T>, comparator: ((a: T, b: T) => number)): T[] {
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
export function padNumber(theNumber: string | number): string {
  return ("0" + theNumber.toString()).slice(-2);
}

/**
 * Check if a is later than b
 * @param {number} hourA
 * @param {number} minuteA
 * @param {number} hourB
 * @param {number} minuteB
 * @returns {number}
 */
export function timeCheck(hourA:number,minuteA:number, hourB:number,minuteB:number):number{
    if (hourA > hourB ) {
        return 1;
    }
    else if(hourA === hourB && (minuteA> minuteB || minuteA == minuteB)){
        return 1;
    }
    return 0;
}