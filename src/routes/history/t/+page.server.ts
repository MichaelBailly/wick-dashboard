import { getAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { getTrades } from '$lib/server/db/trades';
import { getNetPnl } from '$lib/tradeUtils';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import { add, format } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const period = url.searchParams.get('period');
	const [year, month] = parseMonthStringOrNow(period);
	const start = getAtMidnightUTC(year, month, 1);
	const end = add(start, { months: 1 });
	const trades = await getTrades({ start, end });
	const realPeriod = format(add(start, { days: 10 }), 'yyyy-MM');
	const dashboardTrades: DashboardTrade[] = trades.map((trade) => ({
		...trade,
		netPnl: getNetPnl(trade)
	}));

	return {
		period: realPeriod,
		trades: dashboardTrades
	};
}
