import { getAtMidnightUTC, getTodayAtMidnightUTC } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTrades } from '$lib/server/db/trades';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { add } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: ServerLoadEvent) {
	let start;
	let end;
	const date = url.searchParams.get('date');
	if (date === null) {
		start = getTodayAtMidnightUTC();
		end = add(start, { days: 1 });
	} else {
		const [year, month, day] = date.split('-').map((v) => parseInt(v, 10));
		if (year === undefined || month === undefined || day === undefined) {
			return error(400, 'Invalid date');
		}
		start = getAtMidnightUTC(year, month, day);
		end = add(start, { days: 1 });
	}
	const trades = await getTrades({ start, end });

	await ensureReferencesAreLoaded();

	const dashboardTrades: DashboardTrade[] = trades.map(toDashboardTrade);

	return {
		trades: dashboardTrades
	};
}
