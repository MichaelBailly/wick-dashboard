<script lang="ts">
	import { FEE_PER_TRADE } from '$lib/constants.client';
	import { parseMonthStringOrNow } from '$lib/dates';
	import type { PnlPerType } from '$lib/types/PnlPerType';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import { getFamilyLabel } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Button from '@smui/button';
	import DataTable, { Body, Cell, Head, Label, Row } from '@smui/data-table';
	import FormField from '@smui/form-field';
	import Paper from '@smui/paper';
	import Switch from '@smui/switch';
	import { add, format } from 'date-fns';
	import { computePnlPerVolume, type PnlPerVol } from './helpers';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradeRecordClient[]; period: string; pnlPerType: PnlPerType[] };

	let period: string = '';

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };

	let showNegativePnL = false;
	let pnlPerVol: PnlPerVol[] = [];
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
		pnlPerVol = computePnlPerVolume(data.trades);

		pnlPerType = data.pnlPerType.map((pnlPerType) => {
			return {
				...pnlPerType,
				pnl: pnlPerType.pnl - pnlPerType.tradeCount * FEE_PER_TRADE
			};
		});
		pnlPerType.sort((a, b) => b.pnl - a.pnl);

		if (!showNegativePnL) {
			pnlPerType = pnlPerType.filter((pnlPerType) => pnlPerType.pnl > 0);
		}
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
	<h3>PnL per volume family <small><a href="/history/v">More...</a></small></h3>

	<DataTable style="width: 100%;">
		<Head>
			<Row>
				<Cell columnId="volumeFamily">
					<Label>Volume family</Label>
				</Cell>
				<Cell columnId="totalPnl">
					<Label>PnL</Label>
				</Cell>
				<Cell columnId="PnlPerTrade">
					<Label>Pnl per trade</Label>
				</Cell>
				<Cell columnId="tradeCount">
					<Label>Trade Count</Label>
				</Cell>
			</Row>
		</Head>
		<Body>
			{#each pnlPerVol as { family, pnl, pnlPerTrade, tradeCount }}
				<Row>
					<Cell>
						{getFamilyLabel(family)}
					</Cell>
					<Cell>
						$<Pnl {pnl} />
					</Cell>
					<Cell>
						$<Pnl pnl={pnlPerTrade} />
					</Cell>
					<Cell>
						{tradeCount}
					</Cell>
				</Row>
			{/each}
		</Body>
	</DataTable>

	<h3>PnL per watcher type <small><a href="/history/t">More...</a></small></h3>
	<FormField align="end">
		<Switch bind:checked={showNegativePnL} />
		<span slot="label">Show negative PnL</span>
	</FormField>
	<br />
	<DataTable>
		<Head>
			<Row>
				<Cell columnId="watcherType">
					<Label>Watcher type</Label>
				</Cell>
				<Cell columnId="totalPnl">
					<Label>PnL</Label>
				</Cell>
				<Cell columnId="tradeCount">
					<Label>Trade Count</Label>
				</Cell>
			</Row>
		</Head>
		<Body>
			{#each pnlPerType as typeRes}
				<Row>
					<Cell>{typeRes._id}</Cell>
					<Cell>$<Pnl pnl={typeRes.pnl} /></Cell>
					<Cell>{typeRes.tradeCount}</Cell>
				</Row>
			{/each}
		</Body>
	</DataTable>
</Paper>
