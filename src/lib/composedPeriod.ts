import { getAtMidnightUTC, getDateAtMidnightUTC } from '$lib/dates';
import { isPeriod, Period } from '$lib/types/Period';
import { add, format, startOfWeek } from 'date-fns';
import type { ComposedPeriod } from './types/ComposedPeriod';

export function getThisMonthComposedPeriodString() {
	const now = getDateAtMidnightUTC(new Date());
	return `${Period.Month},${format(now, 'yyyyMM')}`;
}

export function stringifyComposedPeriod(composed: ComposedPeriod) {
	return `${composed.unit},${composed.value}`;
}

export function parseComposedPeriod(period: string): ComposedPeriod | undefined {
	const match = period.match(/^(\w+),(\d+)$/);
	const [_, unit, value] = match || [];
	if (!unit || !value) {
		return;
	}
	if (!isPeriod(unit)) {
		return;
	}
	const dates = getDatesForPeriod(unit, value);
	if (!dates) {
		return;
	}
	return { unit, value, dates };
}

export function getDatesForPeriod(unit: Period, count: string) {
	const result = {
		start: new Date(),
		end: new Date()
	};

	if (unit === Period.Day) {
		const year = parseInt(count.slice(0, 4), 10);
		const month = parseInt(count.slice(4, 6), 10);
		const day = parseInt(count.slice(6, 8), 10);
		if (isNaN(year) || isNaN(month) || isNaN(day)) {
			return null;
		}
		result.start = getAtMidnightUTC(year, month, day);
		result.end = add(result.start, { days: 1 });
	} else if (unit === Period.Week) {
		const year = parseInt(count.slice(0, 4), 10);
		const month = parseInt(count.slice(4, 6), 10);
		const day = parseInt(count.slice(6, 8), 10);
		if (isNaN(year) || isNaN(month) || isNaN(day)) {
			return null;
		}
		result.start = getDateAtMidnightUTC(startOfWeek(new Date(year, month - 1, day)));
		result.end = add(result.start, { weeks: 1 });
	} else if (unit === Period.Month) {
		const year = parseInt(count.slice(0, 4), 10);
		const month = parseInt(count.slice(4, 6), 10);
		if (isNaN(year) || isNaN(month)) {
			return null;
		}
		result.start = getAtMidnightUTC(year, month, 1);
		result.end = add(result.start, { months: 1 });
	}

	return result;
}

export function getTodayComposedPeriod(): ComposedPeriod {
	const now = getDateAtMidnightUTC(new Date());
	return {
		unit: Period.Day,
		value: format(new Date(), 'yyyyMMdd'),
		dates: {
			start: now,
			end: add(now, { days: 1 })
		}
	};
}

export function getThisWeekComposedPeriod(): ComposedPeriod {
	const now = getDateAtMidnightUTC(new Date());

	return {
		unit: Period.Week,
		value: format(new Date(), 'yyyyMMdd'),
		dates: {
			start: getDateAtMidnightUTC(startOfWeek(now)),
			end: add(getDateAtMidnightUTC(startOfWeek(now)), { weeks: 1 })
		}
	};
}

export function getThisMonthComposedPeriod(): ComposedPeriod {
	const now = getDateAtMidnightUTC(new Date());

	return {
		unit: Period.Month,
		value: format(new Date(), 'yyyyMM'),
		dates: {
			start: getAtMidnightUTC(now.getFullYear(), now.getMonth() + 1, 1),
			end: add(getAtMidnightUTC(now.getFullYear(), now.getMonth() + 1, 1), { months: 1 })
		}
	};
}

export function getPreviousComposedPeriod(period: ComposedPeriod): ComposedPeriod {
	return getPrevNextComposedPeriod(period);
}

export function getNextComposedPeriod(period: ComposedPeriod): ComposedPeriod {
	return getPrevNextComposedPeriod(period, 1);
}

export function getPrevNextComposedPeriod(period: ComposedPeriod, diff = -1): ComposedPeriod {
	if (period.unit === Period.Day) {
		const dates = {
			start: add(period.dates.start, { days: diff }),
			end: add(period.dates.end, { days: diff })
		};
		return {
			unit: period.unit,
			value: format(dates.start, 'yyyyMMdd'),
			dates
		};
	} else if (period.unit === Period.Week) {
		const dates = {
			start: add(period.dates.start, { weeks: diff }),
			end: add(period.dates.end, { weeks: diff })
		};
		return {
			unit: period.unit,
			value: format(dates.start, 'yyyyMMdd'),
			dates
		};
	}
	const dates = {
		start: add(period.dates.start, { months: diff }),
		end: add(period.dates.end, { months: diff })
	};
	return {
		unit: period.unit,
		value: format(dates.start, 'yyyyMM'),
		dates
	};
}

export function changeComposedPeriodUnit(period: ComposedPeriod, unit: Period): ComposedPeriod {
	if (unit === Period.Day) {
		return {
			unit,
			value: format(period.dates.start, 'yyyyMMdd'),
			dates: {
				start: getDateAtMidnightUTC(period.dates.start),
				end: add(getDateAtMidnightUTC(period.dates.start), { days: 1 })
			}
		};
	} else if (unit === Period.Week) {
		return {
			unit,
			value: format(period.dates.start, 'yyyyMMdd'),
			dates: {
				start: getDateAtMidnightUTC(startOfWeek(period.dates.start)),
				end: add(getDateAtMidnightUTC(startOfWeek(period.dates.start)), { weeks: 1 })
			}
		};
	}
	return {
		unit,
		value: format(period.dates.start, 'yyyyMM'),
		dates: {
			start: getAtMidnightUTC(
				period.dates.start.getFullYear(),
				period.dates.start.getMonth() + 1,
				1
			),
			end: add(
				getAtMidnightUTC(period.dates.start.getFullYear(), period.dates.start.getMonth() + 1, 1),
				{ months: 1 }
			)
		}
	};
}

export function getHumanComposedPeriod(period: ComposedPeriod): string {
	if (period.unit === Period.Day) {
		return format(period.dates.start, 'dd MMMM yyyy');
	} else if (period.unit === Period.Week) {
		return `${format(period.dates.start, 'dd MMMM yyyy')} - ${format(
			period.dates.end,
			'dd MMMM yyyy'
		)}`;
	}
	return format(period.dates.start, 'MMMM yyyy');
}
