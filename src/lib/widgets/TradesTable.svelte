<script lang="ts">
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { getFamilyLabel } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import DataTable, { Body, Cell, Head, Label, Pagination, Row } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import { format, formatDistance } from 'date-fns';
	import MoreLink from './MoreLink.svelte';

	export let trades: DashboardTrade[];

	const rowsPerPage = 100;

	let showPagination = false;
	let page = 0;
	let rows: DashboardTrade[] = [];

	$: {
		rows = trades.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
		showPagination = trades.length > rowsPerPage;
	}
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
	{#if showPagination}
		{@const lastPageIndex = Math.ceil(trades.length / rowsPerPage) - 1}
		<Pagination slot="paginate">
			<svelte:fragment slot="total">
				{page * rowsPerPage + 1}-{(page + 1) * rowsPerPage} of {trades.length}
			</svelte:fragment>

			<IconButton
				class="material-icons"
				action="first-page"
				title="First page"
				on:click={() => (page = 0)}
				disabled={page === 0}>first_page</IconButton>
			<IconButton
				class="material-icons"
				action="prev-page"
				title="Prev page"
				on:click={() => page--}
				disabled={page === 0}>chevron_left</IconButton>
			<IconButton
				class="material-icons"
				action="next-page"
				title="Next page"
				on:click={() => page++}
				disabled={page === lastPageIndex}>chevron_right</IconButton>
			<IconButton
				class="material-icons"
				action="last-page"
				title="Last page"
				on:click={() => (page = lastPageIndex)}
				disabled={page === lastPageIndex}>last_page</IconButton>
		</Pagination>
	{/if}
</DataTable>
