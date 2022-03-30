import { DateTime } from 'luxon';

export const nextQuotaRenewsByPeriod = {
  monthly: DateTime.now().plus({ month: 1 }).toJSDate(),
  daily: DateTime.now().plus({ day: 1 }).toJSDate(),
  hourly: DateTime.now().plus({ hour: 1 }).toJSDate(),
};
