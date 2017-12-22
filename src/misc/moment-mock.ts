export const tz = (timezone: string): any => {
  return {
    hours: () => 1,
    minutes: () => 13,
    unix: () => 1513901626,
  };
};

Object.assign(tz, {
  zone: (timezone: string): any => {
    return {
      name: timezone,
    };
  },
});
