// import * as dfnsTz from 'date-fns-tz';

// export const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// export const getTodayInUserTZ = (timezone) => {
//   const now = new Date();
//   const nowInTZ = dfnsTz.utcToZonedTime(now, timezone);
//   return new Date(nowInTZ.getFullYear(), nowInTZ.getMonth(), nowInTZ.getDate());
// };

// export const isNewDayInUserTZ = (lastFetchDate, timezone) => {
//   const lastFetchInTZ = dfnsTz.utcToZonedTime(new Date(lastFetchDate), timezone);
//   const todayInTZ = getTodayInUserTZ(timezone);
//   return lastFetchInTZ.getTime() < todayInTZ.getTime();
// };


import moment from 'moment-timezone';

// Use moment-timezone for consistent timezone calculations across Metro/Expo
// moment-timezone is already in package.json and is robust on React Native.
export const getUserTimezone = () => {
  // Prefer Intl if available, otherwise fallback to moment's guess
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch (error) {
    console.error("Error getting user timezone:", error);
  }
  return moment.tz.guess();
};

export const getTodayInUserTZ = (timezone) => {
  const tz = timezone || getUserTimezone();
  const now = moment().tz(tz);
  // Construct a Date at local midnight in that timezone
  return new Date(now.year(), now.month(), now.date());
};

export const isNewDayInUserTZ = (lastFetchDate, timezone) => {
  if (!lastFetchDate) return false;
  const tz = timezone || getUserTimezone();
  const last = moment(lastFetchDate).tz(tz).startOf('day');
  const today = moment().tz(tz).startOf('day');
  return last.valueOf() < today.valueOf();
};
