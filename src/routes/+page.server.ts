import { getPnlPerDay } from '$lib/server/db/trades';
import type { URL } from 'url';
import {
	getThisMonthComposedPeriod,
	parseComposedPeriod
} from './history/t/[type]/[config]/helpers';
/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const period: string = url.searchParams.get('period') || '';
	const composed = parseComposedPeriod(period) || getThisMonthComposedPeriod();
	const pnlPerDay = await getPnlPerDay(composed.dates);

	return {
		pnlPerDay
	};
}
