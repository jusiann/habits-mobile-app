import { translate } from './language.utils';

// TABS - HISTORY PAGE'S CONSTANT
export const getMonthNames = () => [
  translate('history.months.january'),
  translate('history.months.february'),
  translate('history.months.march'),
  translate('history.months.april'),
  translate('history.months.may'),
  translate('history.months.june'),
  translate('history.months.july'),
  translate('history.months.august'),
  translate('history.months.september'),
  translate('history.months.october'),
  translate('history.months.november'),
  translate('history.months.december')
];

export const getDayNames = () => [
  translate('history.days.sunday'),
  translate('history.days.monday'),
  translate('history.days.tuesday'),
  translate('history.days.wednesday'),
  translate('history.days.thursday'),
  translate('history.days.friday'),
  translate('history.days.saturday')
];

export const DEFAULT_STATS = {
  currentStreak: 0,
  completionRate: 0,
  totalCompletedDays: 0,
  totalCompleted: 0
};

export const CALENDAR_CONFIG = {
  TOTAL_GRID_DAYS: 42,
  DAYS_IN_WEEK: 7
};

export const DAY_DATA_STRUCTURE = {
  summary: {
    completionRate: 0,
    totalHabits: 0,
    completedHabits: 0,
    inProgressHabits: 0,
    notStartedHabits: 0
  }
};

export const STATS_STRUCTURE = {
  currentStreak: 0,
  completionRate: 0,
  totalCompletedDays: 0,
  totalCompleted: 0
};

export const DATE_FORMAT_OPTIONS = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};