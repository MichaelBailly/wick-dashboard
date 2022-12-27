import { getDateAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { getPnlPerCMCFamily, getPnlPerVolumeFamily } from '$lib/server/db/watchers';
import type { StrategyFamilyMonthPnl } from '$lib/types/StrategyFamilyMonthPnl';
import { add, subMilliseconds } from 'date-fns';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const monthStr = url.searchParams.get('month');
	const familyType = url.searchParams.get('familyType') || 'volume';
	const monthYear = parseMonthStringOrNow(monthStr);
	const dateTemp = new Date(monthYear[0], monthYear[1] - 1, 1);
	const start = getDateAtMidnightUTC(dateTemp);
	const end = subMilliseconds(add(start, { months: 1 }), 1);
	let result: StrategyFamilyMonthPnl[] = [];
	if (familyType === 'cmc') {
		const dbResponse = await getPnlPerCMCFamily({ start, end });
		result = dbResponse.map((sfmy) => {
			return {
				type: sfmy.watcher.type,
				config: sfmy.watcher.config,
				family: sfmy.cmcFamily,
				netPnl: sfmy.netPnl
			};
		});
	} else {
		const dbResponse = await getPnlPerVolumeFamily({ start, end });

		result = dbResponse.map((sfmy) => {
			return {
				type: sfmy.watcher.type,
				config: sfmy.watcher.config,
				family: sfmy.volumeFamily,
				netPnl: sfmy.netPnl
			};
		});
	}

	result.sort((a, b) => b.netPnl - a.netPnl);

	return new Response(JSON.stringify(result));
}
