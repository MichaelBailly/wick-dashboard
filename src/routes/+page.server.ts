import { getAtMidnightUTC, getTodayAtMidnightUTC } from '$lib/dates';
import { getTradesHistory } from '$lib/server/db/trades';
import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { add } from 'date-fns';
import type { TradeRecordClient } from 'src/lib/types/TradeRecordClient';

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
	const trades = await getTradesHistory({ start, end });
	let clientTrades: TradeRecordClient[] = [];
	if (trades) {
		Object.values(trades).forEach((oneDay) => {
			clientTrades = clientTrades.concat(
				oneDay.trades.map((t: TradeRecordClient) => ({
					...t,
					_id: t._id.toString()
				}))
			);
		});
		return {
			trades: clientTrades
		};
	}
	throw new Error('No trades found');
}
