import { getAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTradePnl, getTrades } from '$lib/server/db/trades';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import { add, format } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const period = url.searchParams.get('period');
	const [year, month] = parseMonthStringOrNow(period);
	const start = getAtMidnightUTC(year, month, 1);
	const end = add(start, { months: 1 });
	const trades = await getTrades({ start, end });
	const pnlPerType = await getTradePnl({ start, end });
	const realPeriod = format(add(start, { days: 10 }), 'yyyy-MM');

	await ensureReferencesAreLoaded();

	const dashboardTrades: DashboardTrade[] = trades.map(toDashboardTrade);

	return {
		period: realPeriod,
		trades: dashboardTrades,
		pnlPerType
	};
}
