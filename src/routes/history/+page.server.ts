import { getTradesHistory } from '$lib/server/db/trades';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const trades = await getTradesHistory();

	return {
		trades
	};
}
