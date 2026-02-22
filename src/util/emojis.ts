import * as emojilib from "emojilib";

/** All emojis as parsed from the emojilib library. */
export const ALL_EMOJIS = Object.entries(emojilib).map(([emoji, names]) => emoji);