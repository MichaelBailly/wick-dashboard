import { getDateAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { getPnlPerVolumeFamily } from '$lib/server/db/watchers';
import type { StrategyFamilyMonthPnl } from '$lib/types/StrategyFamilyMonthPnl';
import { add, subMilliseconds } from 'date-fns';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const monthStr = url.searchParams.get('month');
	const monthYear = parseMonthStringOrNow(monthStr);
	const dateTemp = new Date(monthYear[0], monthYear[1] - 1, 1);
	const start = getDateAtMidnightUTC(dateTemp);
	const end = subMilliseconds(add(start, { months: 1 }), 1);

	const dbResponse = await getPnlPerVolumeFamily({ start, end });

	const result: StrategyFamilyMonthPnl[] = dbResponse.map((sfmy) => {
		return {
			type: sfmy.watcher.type,
			config: sfmy.watcher.config,
			volumeFamily: sfmy.volumeFamily,
			netPnl: sfmy.netPnl
		};
	});

	result.sort((a, b) => b.netPnl - a.netPnl);

	return new Response(JSON.stringify(result));
}
