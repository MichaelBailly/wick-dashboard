import { ensureReferencesAreLoaded } from '$lib/server/dashboardTradeConverter';
import {
	getPnlPerCmcFamily,
	getPnlPerDay,
	getPnlPerVolumeFamily,
	getTradePnl
} from '$lib/server/db/trades';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { add, format } from 'date-fns';
import { getThisMonthComposedPeriod, parseComposedPeriod } from './t/[type]/[config]/helpers';
// import type { PageServerLoad } from './$types';

export async function load({ url }: ServerLoadEvent) {
	const period = url.searchParams.get('period');
	const composedPeriod = parseComposedPeriod(period || '') || getThisMonthComposedPeriod();
	const realPeriod = format(add(composedPeriod.dates.start, { days: 10 }), 'yyyy-MM');

	await ensureReferencesAreLoaded();

	return {
		period: realPeriod,
		pnlPerVol: getPnlPerVolumeFamily(composedPeriod.dates),
		pnlPerType: getTradePnl(composedPeriod.dates),
		pnlPerDay: getPnlPerDay(composedPeriod.dates),
		pnlPerCmc: getPnlPerCmcFamily(composedPeriod.dates)
	};
}
