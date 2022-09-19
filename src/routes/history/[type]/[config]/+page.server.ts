import { getTradesHistory } from '$lib/server/db/trades';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const trades = await getTradesHistory({ type: params.type, config: params.config });

	return {
		trades
	};
}
