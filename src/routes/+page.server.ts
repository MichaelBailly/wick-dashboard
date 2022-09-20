import { getTrades } from '$lib/server/db/trades';
import { error } from '@sveltejs/kit';
import type { TradeRecordClient } from 'src/lib/types/TradeRecordClient';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const trades = await getTrades();

	if (trades) {
		const clientTrades: TradeRecordClient[] = trades.map((t: TradeRecordClient) => ({
			...t,
			_id: t._id.toString()
		})) as TradeRecordClient[];
		return {
			trades: clientTrades
		};
	}

	throw error(404, 'Not found');
}
