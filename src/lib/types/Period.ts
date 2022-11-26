export enum Period {
	Day = 'day',
	Week = 'week',
	Month = 'month'
}

export function isPeriod(period: unknown): period is Period {
	return typeof period === 'string' && Object.values(Period).includes(period as Period);
}
