<script lang="ts">
	import { page } from '$app/stores';
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { VolumeFamilies } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import TradesTable from '$lib/widgets/TradesTable.svelte';
	import Button from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { add, format, startOfMonth } from 'date-fns';
	import PnlGraph from './PnlGraph.svelte';
	import VolSuccessRateGraph from './VolSuccessRateGraph.svelte';

	export let data: { trades: DashboardTrade[] };

	const selectedVolume: Record<string, boolean> = {};

	const today = new Date();
	const thisMonth = format(startOfMonth(today), 'yyyy-MM');
	const lastMonth = format(startOfMonth(add(today, { months: -1 })), 'yyyy-MM');

	let period: string = '';
	let pnl = 0;
	let activeTab = 'Graph';
	let activeTrades: DashboardTrade[] = [...data.trades];

	for (const volumeFamily of VolumeFamilies) {
		selectedVolume[volumeFamily.name] = true;
	}

	$: {
		if (Object.values(selectedVolume).every((v) => v)) {
			activeTrades = [...data.trades];
		} else {
			let newActiveTrades: DashboardTrade[] = [];
			data.trades.forEach((t) => {
				const familyName = t.volumeFamily;
				if (familyName && selectedVolume[familyName]) {
					newActiveTrades.push(t);
				}
			});
			activeTrades = newActiveTrades;
		}
	}

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

		pnl = activeTrades.reduce((acc, { netPnl }) => acc + netPnl, 0);
	}

	function isAllSelected() {
		return Object.values(selectedVolume).every((v) => v);
	}
	function updateActiveTrades() {
		if (isAllSelected()) {
			activeTrades = [...data.trades];
		} else {
			let newActiveTrades: DashboardTrade[] = [];
			data.trades.forEach((t) => {
				const familyName = t.volumeFamily;
				if (familyName && selectedVolume[familyName]) {
					newActiveTrades.push(t);
				}
			});
			activeTrades = newActiveTrades;
		}
	}
</script>

<h2>{$page.params.type} {$page.params.config}</h2>

<h3>
	PnL: $<Pnl {pnl} /> (including fees) - {activeTrades.length} trades
</h3>

<p>
	{#if period === 'last30days'}
		<Button disabled>
			<Label>Last 30 days</Label>
		</Button>
	{:else}
		<Button href="/history/t/{$page.params.type}/{$page.params.config}?period=last30days">
			<Label>Last 30 days</Label>
		</Button>
	{/if}
	{#if period === 'last7days'}
		<Button disabled>
			<Label>Last 7 days</Label>
		</Button>
	{:else}
		<Button href="/history/t/{$page.params.type}/{$page.params.config}?period=last7days">
			<Label>Last 7 days</Label>
		</Button>
	{/if}
	{#if period === 'lastMonth'}
		<Button disabled>
			<Label>Last month</Label>
		</Button>
	{:else}
		<Button href="/history/t/{$page.params.type}/{$page.params.config}?period={lastMonth}">
			<Label>Last month</Label>
		</Button>
	{/if}

	{#if period === 'thisMonth'}
		<Button disabled>
			<Label>This month</Label>
		</Button>
	{:else}
		<Button href="/history/t/{$page.params.type}/{$page.params.config}?period={thisMonth}">
			<Label>This month</Label>
		</Button>
	{/if}

	{#if period === 'yesterday'}
		<Button disabled>
			<Label>Yesterday</Label>
		</Button>
	{:else}
		<Button href="/history/t/{$page.params.type}/{$page.params.config}?period=yesterday">
			<Label>Yesterday</Label>
		</Button>
	{/if}
	{#if period === 'today'}
		<Button disabled>
			<Label>Today</Label>
		</Button>
	{:else}
		<Button href="/history/t/{$page.params.type}/{$page.params.config}?period=today">
			<Label>Today</Label>
		</Button>
	{/if}
</p>
<p>
	{#each VolumeFamilies as family}
		<FormField>
			<Checkbox bind:checked={selectedVolume[family.name]} on:input={updateActiveTrades} />
			<span slot="label">{family.label}</span>
		</FormField>
	{/each}
</p>

<TabBar tabs={['Graph', 'Data']} let:tab bind:active={activeTab}>
	<Tab {tab}>
		<Label>{tab}</Label>
	</Tab>
</TabBar>
<div class="tab-content">
	{#if activeTab === 'Graph'}
		<PnlGraph trades={activeTrades} />
		<p>
			<VolSuccessRateGraph trades={activeTrades} />
		</p>
	{:else if activeTab === 'Data'}
		<TradesTable trades={activeTrades} />
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
