import * as moment from "moment-timezone";

// This file contains all the coercers used by ChatSettingTemplates.

export function toBoolean(input: string): boolean | undefined {
  input = input.toUpperCase();
  if (input === "1" || input === "TRUE" || input === "ON" || input === "ENABLE") {
    return true;
  }
  if (input === "0" || input === "FALSE" || input === "OFF" || input === "DISABLE") {
    return false;
  }
  return undefined;
}

export function toNumber(input: string): number | undefined {
  const coerced = Number(input);
  return Number.isNaN(coerced) ? undefined : coerced;
}

export function toWholeNumber(input: string): number | undefined {
  const coerced = Number(input);
  return Number.isNaN(coerced) || coerced % 1 !== 0 ? undefined : coerced;
}

export function toTimezone(input: string): string | undefined {
  return moment.tz.zone(input) === null ? undefined : input;
}
