import moment from 'moment-timezone';
import User from '../models/user.js';

export const DEFAULT_TZ = 'Europe/Istanbul';

export async function resolveUserTimezone(userId) {
    if (!userId) return DEFAULT_TZ;
    try {
        const user = await User.findById(userId);
        return user?.timezone || DEFAULT_TZ;
    } catch (err) {
        return DEFAULT_TZ;
    }
}

export function tzDayRange(input, tz) {
    const m = moment.isMoment(input) ? input.clone().tz(tz) : moment.tz(input || undefined, tz);
    const start = m.clone().startOf('day').toDate();
    const end = m.clone().add(1, 'day').startOf('day').toDate();
    return { start, end };
}

export function dayStart(input, tz) {
    return tzDayRange(input, tz).start;
}

export default {
    DEFAULT_TZ,
    resolveUserTimezone,
    tzDayRange,
    dayStart
};
