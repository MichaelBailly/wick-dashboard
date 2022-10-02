<script lang="ts">
	import { FEE_PER_TRADE } from '$lib/constants.client';
	import { parseMonthStringOrNow } from '$lib/dates';
	import type { PnlPerType } from '$lib/types/PnlPerType';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import { getFamilyLabel, getVolumeFamily } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Button from '@smui/button';
	import Paper from '@smui/paper';
	import { add, format } from 'date-fns';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradeRecordClient[]; period: string; pnlPerType: PnlPerType[] };

	let period: string = '';

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let pnlPerVol: { family: string; pnl: number; pnlPerTrade: number; tradeCount: number }[] = [];
	let pnlPerType: PnlPerType[] = [];

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

		// results formatting
		const tradesPerVolume: Map<string, TradeRecordClient[]> = new Map();

		data.trades.forEach((trade) => {
			const family = getVolumeFamily(trade.pair);
			if (!family) {
				return;
			}
			let trades = tradesPerVolume.get(family);
			if (!trades) {
				trades = [];
			}
			trades.push(trade);
			tradesPerVolume.set(family, trades);
		});
		pnlPerVol = Array.from(tradesPerVolume.entries()).map(([family, trades]) => {
			const pnl = trades.reduce((acc, trade) => acc + trade.pnl, 0) - trades.length * FEE_PER_TRADE;
			const pnlPerTrade = pnl / trades.length;
			return { family, pnl, pnlPerTrade, tradeCount: trades.length };
		});
		pnlPerVol.sort((a, b) => b.pnl - a.pnl);

		pnlPerType = data.pnlPerType.map((pnlPerType) => {
			return {
				...pnlPerType,
				pnl: pnlPerType.pnl - pnlPerType.tradeCount * FEE_PER_TRADE
			};
		});
		pnlPerType.sort((a, b) => b.pnl - a.pnl);
	}
</script>

<div class="head-container">
	<h1>
		{period}
	</h1>
	<div class="head-date-picker">
		<Button href="/history?period={prevPeriod.machine}">{prevPeriod.human}</Button>
		<Button href="/history?period={nextPeriod.machine}">{nextPeriod.human}</Button>
	</div>
</div>

<Paper>
	<h3>PnL per volume family</h3>
	{#each pnlPerVol as { family, pnl, pnlPerTrade, tradeCount }}
		<div>
			{getFamilyLabel(family)}
			<span>$<Pnl {pnl} /></span>
			<span>$<Pnl pnl={pnlPerTrade} /> per trade, {tradeCount} trades</span>
		</div>
	{/each}

	<h3>PnL per watcher type <small><a href="/history/t">More...</a></small></h3>
	{#each pnlPerType as typeRes}
		<div>
			{typeRes._id}
			<span><Pnl pnl={typeRes.pnl} /> in {typeRes.tradeCount} trades</span>
		</div>
	{/each}
</Paper>
