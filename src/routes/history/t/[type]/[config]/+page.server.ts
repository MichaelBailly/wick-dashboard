import { getAtMidnightUTC, getDateAtMidnightUTC, getTodayAtMidnightUTC } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTrades, type TradeHistoryOpts } from '$lib/server/db/trades';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { HistoryTypeLoadArgs } from '$lib/types/HistoryTypeLoadArgs';
import { add, startOfMonth } from 'date-fns';
import { parseComposedPeriod } from './helpers';

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

	const middle = findMiddleDate(start, end || new Date());

	const opts1: TradeHistoryOpts = { type: params.type, config: params.config, start, end: middle };
	const opts2: TradeHistoryOpts = { type: params.type, config: params.config, start: middle, end };

	const trades = await getTradesSplit(start, end || new Date(), 4, {
		type: params.type,
		config: params.config
	});
	await ensureReferencesAreLoaded();
	const dbTrades: DashboardTrade[] = trades.map(toDashboardTrade);

	return {
		trades: dbTrades
	};
}

function findMiddleDate(start: Date, end: Date): Date {
	const diff = end.getTime() - start.getTime();
	const half = Math.round(diff / 2);
	return new Date(start.getTime() + half);
}

async function getTradesSplit(
	start: Date,
	end: Date,
	split: number,
	baseArgs: TradeHistoryOpts = {}
) {
	const diff = end.getTime() - start.getTime();
	const increment = Math.round(diff / split);

	const opts = [];
	for (let i = 0; i < split; i++) {
		const startInterval = new Date(end.getTime() - increment * (i + 1));
		const endInterval = new Date(end.getTime() - increment * i);
		opts.push(getTrades({ ...baseArgs, start: startInterval, end: endInterval }));
	}

	const promiseResponse = await Promise.all(opts);
	const trades = promiseResponse.reduce((acc, v) => acc.concat(v), []);
	return trades;
}
