import { parseComposedPeriod } from '$lib/composedPeriod';
import { getAtMidnightUTC, getDateAtMidnightUTC, getTodayAtMidnightUTC } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTradesParallel } from '$lib/server/getTradesParallel';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { HistoryTypeLoadArgs } from '$lib/types/HistoryTypeLoadArgs';
import { add, startOfMonth } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, params }: HistoryTypeLoadArgs) {
	const period = url.searchParams.get('period') || 'last30days';
	let start: Date | undefined;
	let end: Date | undefined;

	if (period === 'today') {
		start = getTodayAtMidnightUTC();
	} else if (period === 'yesterday') {
		end = getTodayAtMidnightUTC();
		start = add(end, { days: -1 });
	} else if (period === 'last7days') {
		start = getTodayAtMidnightUTC();
		start = add(start, { days: -7 });
	} else if (period !== null && /\d\d\d\d-\d\d/.test(period)) {
		const [year, month] = period.split('-').map((v) => parseInt(v, 10));
		start = getAtMidnightUTC(year, month, 1);
		end = add(start, { months: 1 });
	} else {
		const composed = parseComposedPeriod(period);
		if (composed) {
			start = composed.dates.start;
			end = composed.dates.end;
		} else {
			// this month
			start = getTodayAtMidnightUTC();
			start = getDateAtMidnightUTC(startOfMonth(start));
		}
	}

	const trades = await getTradesParallel(start, end || new Date(), 4, {
		type: params.type,
		config: params.config
	});
	await ensureReferencesAreLoaded();
	const dbTrades: DashboardTrade[] = trades.map(toDashboardTrade);

	return {
		trades: dbTrades
	};
}
