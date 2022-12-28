import { getAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { ensureReferencesAreLoaded } from '$lib/server/dashboardTradeConverter';
import { getPnlPerVolumeFamily, getTradePnl } from '$lib/server/db/trades';
import { add, format } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const period = url.searchParams.get('period');
	const [year, month] = parseMonthStringOrNow(period);
	const start = getAtMidnightUTC(year, month, 1);
	const end = add(start, { months: 1 });
	const pnlPerType = await getTradePnl({ start, end });
	const pnlPerVol = await getPnlPerVolumeFamily({ start, end });
	const realPeriod = format(add(start, { days: 10 }), 'yyyy-MM');

	await ensureReferencesAreLoaded();

	return {
		period: realPeriod,
		pnlPerVol,
		pnlPerType
	};
}
