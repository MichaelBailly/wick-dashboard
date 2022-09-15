<script lang="ts">
	import DataTable, { Body, Cell, Head, Label, Row } from '@smui/data-table';
	import { format, formatDistance } from 'date-fns';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<DataTable style="width: 100%;">
	<Head>
		<Row>
			<Cell columnId="setupType">
				<Label>Setup</Label>
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
			<Cell columnId="result">
				<Label>PnL</Label>
			</Cell>
		</Row>
	</Head>
	<Body>
		{#each data.trades as t}
			<Row>
				<Cell>
					{t.watcher.type}
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
					<span class={t.pnl > 0 ? 'green' : 'red'}>
						{Math.trunc(t.pnl * 100) / 100}
					</span></Cell
				>
			</Row>
		{/each}
	</Body>
</DataTable>

<style>
	.green {
		color: green;
	}
	.red {
		color: red;
	}
</style>
