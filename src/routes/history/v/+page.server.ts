import { getAtMidnightUTC, parseMonthStringOrNow } from '$lib/dates';
import { add, format } from 'date-fns';
import { computeBestGroupPerType, computePerTypePerVolumeFamily } from './helper';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const period = url.searchParams.get('period');
	const [year, month] = parseMonthStringOrNow(period);
	const start = getAtMidnightUTC(year, month, 1);
	const end = add(start, { months: 1 });
	const realPeriod = format(add(start, { days: 10 }), 'yyyy-MM');

	const bestGroupPerType = computeBestGroupPerType({ start, end });
	const pnlPerType = computePerTypePerVolumeFamily({ start, end });

	return {
		pnlPerType,
		bestGroupPerType,
		period: realPeriod
	};
}
