import { DateTime } from 'luxon';

export const startOfMonth = () =>
  DateTime.now().set({ day: 1, hour: 0, minute: 0, second: 0 }).toISO();

export const startOfDay = () =>
  DateTime.now().set({ hour: 0, minute: 0, second: 0 }).toISO();

export const startOfHour = () =>
  DateTime.now().set({ minute: 0, second: 0 }).toISO();
