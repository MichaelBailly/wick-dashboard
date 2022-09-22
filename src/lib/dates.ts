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
