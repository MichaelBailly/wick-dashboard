<script lang="ts">
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { getFamilyLabel } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import DataTable, { Body, Cell, Head, Label, Row } from '@smui/data-table';
	import { format, formatDistance } from 'date-fns';
	import MoreLink from './MoreLink.svelte';

	export let trades: DashboardTrade[];
</script>

<DataTable style="width: 100%;">
	<Head>
		<Row>
			<Cell columnId="setupType">
				<Label>Type</Label>
			</Cell>
			<Cell columnId="pair">
				<Label>Pair</Label>
			</Cell>
			<Cell columnId="pair">
				<Label>Volume Family</Label>
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
					{t.watcher.config}
					<MoreLink href="/history/t/{t.watcher.type}/{t.watcher.config}" />
				</Cell>
				<Cell>
					{t.pair}
				</Cell>
				<Cell>
					{getFamilyLabel(t.volumeFamily)}
				</Cell>
				<Cell>
					{format(t.boughtTimestamp, 'yy, EEE MMM d HH:mm')}
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
					<Pnl pnl={t.netPnl} />
				</Cell>
			</Row>
		{/each}
	</Body>
</DataTable>
