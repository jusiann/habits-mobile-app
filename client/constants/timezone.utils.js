import {zonedTimeToUtc, utcToZonedTime, format} from 'date-fns-tz';

export const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getTodayInUserTZ = (timezone) => {
  const now = new Date();
  const nowInTZ = utcToZonedTime(now, timezone);
  return new Date(nowInTZ.getFullYear(), nowInTZ.getMonth(), nowInTZ.getDate());
};

export const isNewDayInUserTZ = (lastFetchDate, timezone) => {
  const lastFetchInTZ = utcToZonedTime(new Date(lastFetchDate), timezone);
  const todayInTZ = getTodayInUserTZ(timezone);
  return lastFetchInTZ.getTime() < todayInTZ.getTime();
};
