<script lang="ts">
	import { page } from '$app/stores';
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { Period } from '$lib/types/Period';
	import { VolumeFamilies } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import TradesTable from '$lib/widgets/TradesTable.svelte';
	import Button, { Group, Icon } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { format } from 'date-fns';
	import {
		changeComposedPeriodUnit,
		getNextComposedPeriod,
		getPreviousComposedPeriod,
		getThisMonthComposedPeriod,
		getTodayComposedPeriod,
		parseComposedPeriod,
		stringifyComposedPeriod,
		type ComposedPeriod
	} from './helpers';
	import PnlGraph from './PnlGraph.svelte';
	import VolSuccessRateGraph from './VolSuccessRateGraph.svelte';

	export let data: { trades: DashboardTrade[] };

	const selectedVolume: Record<string, boolean> = {};

	const today = new Date();

	let selectedTimerange: Period = Period.Month;
	let periodObj: ComposedPeriod =
		parseComposedPeriod(`${Period.Month}-${format(today, 'yyyyMM')}`) ||
		getThisMonthComposedPeriod();

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
		periodObj =
			parseComposedPeriod(`${Period.Month}-${format(today, 'yyyyMM')}`) ||
			getThisMonthComposedPeriod();
		const urlPeriod = $page.url.searchParams.get('period');
		if (urlPeriod) {
			const composed = parseComposedPeriod(urlPeriod);
			if (composed) {
				periodObj = composed;
			}
		}
		selectedTimerange = periodObj.unit;
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

<svelte:head>
	<title>History for {$page.params.type} {$page.params.config}</title>
</svelte:head>

<h2>{$page.params.type} {$page.params.config}</h2>
<h3>
	PnL: $<Pnl {pnl} /> (including fees) - {activeTrades.length} trades
</h3>
<h4>
	<div>
		<Button
			href="/history/t/{$page.params.type}/{$page.params.config}?period={stringifyComposedPeriod(
				getPreviousComposedPeriod(periodObj)
			)}">
			<Icon class="material-icons">chevron_left</Icon>
		</Button>
		{#if periodObj.unit === Period.Month}
			{format(periodObj.dates.start, 'LLL yyyy')}
		{:else if periodObj.unit === Period.Day}
			{format(periodObj.dates.start, 'yyyy-MM-dd')}
		{/if}
		<Button
			href="/history/t/{$page.params.type}/{$page.params.config}?period={stringifyComposedPeriod(
				getNextComposedPeriod(periodObj)
			)}">
			<Icon class="material-icons">chevron_right</Icon>
		</Button>
	</div>
	<div>
		<Button
			href="/history/t/{$page.params.type}/{$page.params.config}?period={stringifyComposedPeriod(
				getTodayComposedPeriod()
			)}">
			<Label>today</Label>
		</Button>
		<Button
			href="/history/t/{$page.params.type}/{$page.params.config}?period={stringifyComposedPeriod(
				getThisMonthComposedPeriod()
			)}">
			<Label>this month</Label>
		</Button>
		<Group variant="outlined">
			<Button
				href="/history/t/{$page.params.type}/{$page.params.config}?period={stringifyComposedPeriod(
					changeComposedPeriodUnit(periodObj, Period.Month)
				)}"
				color="secondary"
				disabled={periodObj.unit === Period.Month}>
				<Label>Monthly</Label>
			</Button>
			<Button
				href="/history/t/{$page.params.type}/{$page.params.config}?period={stringifyComposedPeriod(
					changeComposedPeriodUnit(periodObj, Period.Day)
				)}"
				color="secondary"
				disabled={periodObj.unit === Period.Day}>
				<Label>Daily</Label>
			</Button>
		</Group>
	</div>
</h4>
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

	h4 {
		display: flex;
		justify-content: start;
	}
</style>
