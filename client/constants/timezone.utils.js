import moment from 'moment-timezone';

export const getUserTimezone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) 
      return tz;
  } catch (error) {
    console.error("Error getting user timezone:", error);
  } finally {
    return moment.tz.guess();
  }
};

export const getTodayInUserTZ = (timezone) => {
  const tz = timezone || getUserTimezone();
  const now = moment().tz(tz);
  return new Date(now.year(), now.month(), now.date());
};

export const isNewDayInUserTZ = (lastFetchDate, timezone) => {
  if (!lastFetchDate) return false;
  const tz = timezone || getUserTimezone();
  const last = moment(lastFetchDate).tz(tz).startOf('day');
  const today = moment().tz(tz).startOf('day');
  return last.valueOf() < today.valueOf();
};
