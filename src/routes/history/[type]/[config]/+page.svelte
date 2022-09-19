<script lang="ts">
	import { page } from '$app/stores';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import type { TradesHistoryResponse } from '$lib/types/TradesHistoryResponse';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import PnlGraph from './PnlGraph.svelte';
	import TradesDataTable from './TradesDataTable.svelte';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradesHistoryResponse };

	let activeTab = 'Graph';

	const trades: TradeRecordClient[] = Object.values(data.trades).reduce(
		(acc, { trades }) => [...acc, ...trades],
		[] as TradeRecordClient[]
	);
</script>

<h2>{$page.params.type} {$page.params.config}</h2>

<TabBar tabs={['Graph', 'Data']} let:tab bind:active={activeTab}>
	<!-- Note: the `tab` property is required! -->
	<Tab {tab}>
		<Label>{tab}</Label>
	</Tab>
</TabBar>
<div class="tab-content">
	{#if activeTab === 'Graph'}
		<PnlGraph {trades} />
	{:else if activeTab === 'Data'}
		<TradesDataTable {trades} />
	{/if}
</div>

<style>
	.tab-content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		justify-content: center;
		padding: 1rem;
	}
</style>
