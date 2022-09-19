<script lang="ts">
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';

	export let trades: TradeRecordClient[];

	const sortedTrades = trades.sort(
		(a, b) => b.soldTimestamp.getTime() - a.boughtTimestamp.getTime()
	);
</script>

<DataTable table$aria-label="Trades list" style="max-width: 100%;">
	<Head>
		<Row>
			<Cell>Date</Cell>
			<Cell>Pair</Cell>
			<Cell numeric>PNL</Cell>
		</Row>
	</Head>
	<Body>
		{#each sortedTrades as trade}
			<Row>
				<Cell>{trade.boughtTimestamp.toLocaleString()}</Cell>
				<Cell>{trade.pair}</Cell>
				<Cell numeric><Pnl pnl={trade.pnl} /></Cell>
			</Row>
		{/each}
	</Body>
</DataTable>
