<script lang="ts">
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import DataTable, { Body, Cell, Head, Label, Row } from '@smui/data-table';
	import { format, formatDistance } from 'date-fns';

	export let trades: TradeRecordClient[];
</script>

<DataTable style="width: 100%;">
	<Head>
		<Row>
			<Cell columnId="setupType">
				<Label>Setup</Label>
			</Cell>
			<Cell columnId="setupConfig">
				<Label>Config</Label>
			</Cell>
			<Cell columnId="pair">
				<Label>Pair</Label>
			</Cell>
			<Cell columnId="boughtTimestamp">
				<Label>Trade Start</Label>
			</Cell>
			<Cell columnId="tradeDuration">
				<Label>Duration</Label>
			</Cell>
			<Cell columnId="entryPrice">
				<Label>Entry Price</Label>
			</Cell>
			<Cell columnId="exitPrice">
				<Label>Exit Price</Label>
			</Cell>
			<Cell columnId="result">
				<Label>PnL</Label>
			</Cell>
		</Row>
	</Head>
	<Body>
		{#each trades as t}
			<Row>
				<Cell>
					{t.watcher.type}
				</Cell>
				<Cell>
					{t.watcher.config}
				</Cell>
				<Cell>
					{t.pair}
				</Cell>
				<Cell>
					{format(t.boughtTimestamp, 'yy MMM EEE i HH:mm')}
				</Cell>
				<Cell>
					{formatDistance(t.soldTimestamp, t.boughtTimestamp)}
				</Cell>
				<Cell>
					{t.price}
				</Cell>
				<Cell>
					{t.soldPrice}
				</Cell>
				<Cell>
					<Pnl pnl={t.pnl} />
				</Cell>
			</Row>
		{/each}
	</Body>
</DataTable>
