<script lang="ts">
	import { page } from '$app/stores';
	import { FEE_PER_TRADE } from '$lib/constants.client';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import type { TradesHistoryResponse } from '$lib/types/TradesHistoryResponse';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import TradesTable from '$lib/widgets/TradesTable.svelte';
	import Button from '@smui/button';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { add, format, startOfMonth } from 'date-fns';
	import PnlGraph from './PnlGraph.svelte';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradesHistoryResponse };

	const today = new Date();
	const thisMonth = format(startOfMonth(today), 'yyyy-MM');
	const lastMonth = format(startOfMonth(add(today, { months: -1 })), 'yyyy-MM');

	let trades: TradeRecordClient[] = [];
	let period: string = '';
	let pnl = 0;

	$: {
		const urlPeriod = $page.url.searchParams.get('period');
		if (!urlPeriod) {
			period = 'last30days';
		} else if (['today', 'yesterday', 'last7days', 'thisMonth', 'lastMonth'].includes(urlPeriod)) {
			period = urlPeriod;
		} else if (urlPeriod === thisMonth) {
			period = 'thisMonth';
		} else if (urlPeriod === lastMonth) {
			period = 'lastMonth';
		} else {
			period = 'last30days';
		}

		trades = Object.values(data.trades)
			.reduce((acc, { trades }) => [...acc, ...trades], [] as TradeRecordClient[])
			.sort((a, b) => a.boughtTimestamp.getTime() - b.boughtTimestamp.getTime());

		pnl = trades.reduce((acc, { pnl }) => acc + pnl, 0);
		pnl -= FEE_PER_TRADE * trades.length;
	}

	let activeTab = 'Graph';
</script>

<h2>{$page.params.type} {$page.params.config}</h2>

<h3>
	PnL: $<Pnl {pnl} /> (including fees) - {trades.length} trades
</h3>

<p>
	{#if period === 'last30days'}
		<Button disabled>
			<Label>Last 30 days</Label>
		</Button>
	{:else}
		<Button href="/history/{$page.params.type}/{$page.params.config}?period=last30days">
			<Label>Last 30 days</Label>
		</Button>
	{/if}
	{#if period === 'last7days'}
		<Button disabled>
			<Label>Last 7 days</Label>
		</Button>
	{:else}
		<Button href="/history/{$page.params.type}/{$page.params.config}?period=last7days">
			<Label>Last 7 days</Label>
		</Button>
	{/if}
	{#if period === 'lastMonth'}
		<Button disabled>
			<Label>Last month</Label>
		</Button>
	{:else}
		<Button href="/history/{$page.params.type}/{$page.params.config}?period={lastMonth}">
			<Label>Last month</Label>
		</Button>
	{/if}

	{#if period === 'thisMonth'}
		<Button disabled>
			<Label>This month</Label>
		</Button>
	{:else}
		<Button href="/history/{$page.params.type}/{$page.params.config}?period={thisMonth}">
			<Label>This month</Label>
		</Button>
	{/if}

	{#if period === 'yesterday'}
		<Button disabled>
			<Label>Yesterday</Label>
		</Button>
	{:else}
		<Button href="/history/{$page.params.type}/{$page.params.config}?period=yesterday">
			<Label>Yesterday</Label>
		</Button>
	{/if}
	{#if period === 'today'}
		<Button disabled>
			<Label>Today</Label>
		</Button>
	{:else}
		<Button href="/history/{$page.params.type}/{$page.params.config}?period=today">
			<Label>Today</Label>
		</Button>
	{/if}
</p>

<TabBar tabs={['Graph', 'Data']} let:tab bind:active={activeTab}>
	<Tab {tab}>
		<Label>{tab}</Label>
	</Tab>
</TabBar>
<div class="tab-content">
	{#if activeTab === 'Graph'}
		<PnlGraph {trades} />
	{:else if activeTab === 'Data'}
		<TradesTable {trades} />
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
