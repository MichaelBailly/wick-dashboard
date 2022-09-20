import { getTradesHistory, type TradeHistoryOpts } from '$lib/server/db/trades';
import type { HistoryTypeLoadArgs } from '$lib/types/HistoryTypeLoadArgs';
import { add } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, params }: HistoryTypeLoadArgs) {
	const period = url.searchParams.get('period') || 'last30days';
	let start: Date | undefined;
	let end: Date | undefined;

	if (period === 'today') {
		start = new Date();
		start.setUTCHours(0, 0, 0, 0);
	} else if (period === 'yesterday') {
		end = new Date();
		end.setUTCHours(0, 0, 0, 0);
		start = add(end, { days: -1 });
	} else if (period === 'last7days') {
		start = new Date();
		start.setUTCHours(0, 0, 0, 0);
		start = add(start, { days: -7 });
	} else if (period !== null && /\d\d\d\d-\d\d/.test(period)) {
		const [year, month] = period.split('-').map((v) => parseInt(v, 10));
		start = new Date(new Date(Number(year), Number(month) - 1, 1).setUTCHours(0, 0, 0, 0));
		end = add(start, { months: 1 });
	} else {
		// last30days
		start = new Date();
		start.setUTCHours(0, 0, 0, 0);
		start = add(start, { days: -30 });
	}

	const opts: TradeHistoryOpts = { type: params.type, config: params.config, start, end };

	const trades = await getTradesHistory(opts);

	return {
		trades
	};
}
