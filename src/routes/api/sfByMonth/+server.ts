import { getDateAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTrades } from '$lib/server/db/trades';
import type { StrategyFamilyMonthPnl } from '$lib/types/StrategyFamilyMonthPnl';
import { add, subMilliseconds } from 'date-fns';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const monthStr = url.searchParams.get('month');
	const noNegative = url.searchParams.get('noNegative') === 'true';
	const monthYear = parseMonthStringOrNow(monthStr);
	const dateTemp = new Date(monthYear[0], monthYear[1] - 1, 1);
	const start = getDateAtMidnightUTC(dateTemp);
	const end = subMilliseconds(add(start, { months: 1 }), 1);

	await ensureReferencesAreLoaded();

	const trades = await getTrades({ start, end });

	const sfmyHash: { [key: string]: StrategyFamilyMonthPnl } = {};
	for (const t of trades) {
		const trade = toDashboardTrade(t);
		const key = `${trade.watcher.type}-${trade.watcher.config}-${trade.volumeFamily}`;
		let sfmy = sfmyHash[key];
		if (!sfmy) {
			sfmy = {
				type: trade.watcher.type,
				config: trade.watcher.config,
				volumeFamily: trade.volumeFamily,
				netPnl: 0
			};
			sfmyHash[key] = sfmy;
		}
		sfmy.netPnl += trade.netPnl;
	}

	const result: StrategyFamilyMonthPnl[] = [];
	for (const kv of Object.entries(sfmyHash)) {
		const sfmy = kv[1];
		if (noNegative && sfmy.netPnl <= 0) {
			continue;
		}
		result.push(sfmy);
	}
	result.sort((a, b) => b.netPnl - a.netPnl);

	return new Response(JSON.stringify(result));
}