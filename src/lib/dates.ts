import { format } from 'date-fns';

export function getAtMidnightUTC(year: number, month: number, day: number): Date {
	const d = new Date();
	d.setUTCHours(0, 0, 0, 0);
	d.setDate(day);
	d.setFullYear(year);
	d.setMonth(month - 1);
	return d;
}

export function getTodayAtMidnightUTC(): Date {
	const d = new Date();

	return getAtMidnightUTC(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function getDateAtMidnightUTC(date: Date): Date {
	return getAtMidnightUTC(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function parseMonthStringOrNow(period?: string | null): [number, number] {
	if (!period) {
		period = format(new Date(), 'yyyy-MM');
	}
	let [year, month] = period.split('-').map((d) => parseInt(d, 10));
	if (isNaN(year)) {
		year = new Date().getFullYear();
	}
	if (isNaN(month)) {
		month = new Date().getMonth() + 1;
	}

	return [year, month];
}

export function toMonthString(date: Date): string {
	return format(date, 'yyyy-MM');
}
