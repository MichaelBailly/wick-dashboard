<script lang="ts">
	import { FEE_PER_TRADE } from '$lib/constants.client';
	import { parseMonthStringOrNow } from '$lib/dates';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import { getVolumeFamily } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Button from '@smui/button';
	import Paper from '@smui/paper';
	import { add, format } from 'date-fns';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradeRecordClient[]; period: string };

	let period: string = '';

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };

	let pnlPerTypePerVolumeFamily: {
		volumeFamily: string;
		pnl: number;
		tradeCount: number;
		watcher: {
			type: string;
			config: string;
		};
	}[] = [];
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

		pnlPerTypePerVolumeFamily = [];
		data.trades.forEach((t) => {
			const family = getVolumeFamily(t.pair);
			if (!family) return;
			let pptpvf = pnlPerTypePerVolumeFamily.find(
				(p) =>
					p.watcher.type === t.watcher.type &&
					p.watcher.config === t.watcher.config &&
					p.volumeFamily === family
			);
			if (!pptpvf) {
				pptpvf = {
					volumeFamily: family,
					pnl: 0,
					tradeCount: 0,
					watcher: { ...t.watcher }
				};
				pnlPerTypePerVolumeFamily.push(pptpvf);
			}
			pptpvf.pnl += t.pnl - FEE_PER_TRADE;
			pptpvf.tradeCount += 1;
		});

		pnlPerTypePerVolumeFamily.sort((a, b) => b.pnl - a.pnl);
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
</Paper>
