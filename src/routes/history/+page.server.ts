import { ensureReferencesAreLoaded } from '$lib/server/dashboardTradeConverter';
import { getPnlPerCmcFamily, getPnlPerVolumeFamily, getTradePnl } from '$lib/server/db/trades';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { add, format } from 'date-fns';
import { getThisMonthComposedPeriod, parseComposedPeriod } from './t/[type]/[config]/helpers';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: ServerLoadEvent) {
	const period = url.searchParams.get('period');
	const composedPeriod = parseComposedPeriod(period || '') || getThisMonthComposedPeriod();
	const { start, end } = composedPeriod.dates;
	const pnlPerType = await getTradePnl({ start, end });
	const pnlPerVol = await getPnlPerVolumeFamily({ start, end });
	const realPeriod = format(add(start, { days: 10 }), 'yyyy-MM');

	await ensureReferencesAreLoaded();

	return {
		period: realPeriod,
		pnlPerVol,
		pnlPerType,
		pnlPerCmc: getPnlPerCmcFamily({ start, end })
	};
}
