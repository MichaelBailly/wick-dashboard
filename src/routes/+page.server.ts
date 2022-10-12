import { getPnlPerDay } from '$lib/server/db/trades';

export async function load() {
	const pnlPerDay = await getPnlPerDay();

	return {
		pnlPerDay
	};
}
