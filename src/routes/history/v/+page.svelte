<script lang="ts">
	import { parseMonthStringOrNow } from '$lib/dates';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Button from '@smui/button';
	import FormField from '@smui/form-field';
	import Paper from '@smui/paper';
	import Switch from '@smui/switch';
	import { add, format } from 'date-fns';
	import {
		computeBestGroupPerType,
		computePerTypePerVolumeFamily,
		type BestGroup,
		type PnlPerTypePerVolumeFamily
	} from './helper';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradeRecordClient[]; period: string };

	let period: string = '';

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };

	let showNegativePnL = false;
	let pnlPerTypePerVolumeFamily: PnlPerTypePerVolumeFamily[] = [];

	let bestGroupPerType: BestGroup[] = [];

	$: {
		// dates navigation
		const [year, month] = parseMonthStringOrNow(data.period);
		const thisMonthDate = new Date(year, month - 1, 10);
		period = format(thisMonthDate, 'MMMM yyyy');
		const nextMonthDate = add(thisMonthDate, { months: 1 });
		const prevMonthDate = add(thisMonthDate, { months: -1 });
		prevPeriod = {
			human: format(prevMonthDate, 'MMMM yyyy'),
			machine: format(prevMonthDate, 'yyyy-MM')
		};
		nextPeriod = {
			human: format(nextMonthDate, 'MMMM yyyy'),
			machine: format(nextMonthDate, 'yyyy-MM')
		};

		// compute data
		// pnl per trade type per volume family

		pnlPerTypePerVolumeFamily = computePerTypePerVolumeFamily(data.trades, showNegativePnL);

		// compute
		// best group of families per type
		bestGroupPerType = computeBestGroupPerType(data.trades);
	}
</script>

<Paper>
	<div class="head-container">
		<h1>
			{period}
		</h1>
		<div class="head-date-picker">
			<Button href="/history/v?period={prevPeriod.machine}">{prevPeriod.human}</Button>
			<Button href="/history/v?period={nextPeriod.machine}">{nextPeriod.human}</Button>
		</div>
	</div>
	<FormField align="end">
		<Switch bind:checked={showNegativePnL} />
		<span slot="label">Show negative PnL</span>
	</FormField>
	<div>
		{#each pnlPerTypePerVolumeFamily as pptpvf}
			<div>
				<strong>{pptpvf.volumeFamily} {pptpvf.watcher.type} {pptpvf.watcher.config}</strong>: <Pnl
					pnl={pptpvf.pnl} /> ({pptpvf.tradeCount}
				trades)
				<a href="/history/t/{pptpvf.watcher.type}/{pptpvf.watcher.config}?period={data.period}"
					>details</a>
			</div>
		{/each}
	</div>
	<h3>Best combinations per type</h3>
	{#each bestGroupPerType as best}
		<div>
			<strong>{best.watcher.type} {best.watcher.config}</strong>: <Pnl pnl={best.pnl} /> ({best.families.join(
				', '
			)})
			<a href="/history/t/{best.watcher.type}/{best.watcher.config}?period={data.period}"
				>details</a>
		</div>
	{/each}
</Paper>
