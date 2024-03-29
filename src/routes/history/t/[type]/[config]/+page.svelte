<script lang="ts">
	import { page } from '$app/stores';
	import { getThisMonthComposedPeriod, parseComposedPeriod } from '$lib/composedPeriod';
	import { FamilySource, familySource } from '$lib/stores/familySource';
	import type { ComposedPeriod } from '$lib/types/ComposedPeriod';
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { Period } from '$lib/types/Period';
	import { VolumeFamilies } from '$lib/volumeReference';
	import IntervalDateControl from '$lib/widgets/IntervalDateControl.svelte';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import TradesTable from '$lib/widgets/TradesTable.svelte';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import Radio from '@smui/radio';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { format } from 'date-fns';

	import PnlGraph from './PnlGraph.svelte';

	export let data: { trades: DashboardTrade[] };

	const familyTypes: Map<FamilySource, Function> = new Map();
	familyTypes.set(FamilySource.Volume, (t: DashboardTrade) => t.volumeFamily);
	familyTypes.set(FamilySource.Cmc, (t: DashboardTrade) => t.cmcFamily);

	const selectedFamily: Record<string, boolean> = {};

	const today = new Date();

	let selectedTimerange: Period = Period.Month;
	let periodObj: ComposedPeriod =
		parseComposedPeriod(`${Period.Month}-${format(today, 'yyyyMM')}`) ||
		getThisMonthComposedPeriod();

	let pnl = 0;
	let activeTab = 'Graph';
	let activeTrades: DashboardTrade[] = [...data.trades];

	for (const volumeFamily of VolumeFamilies) {
		selectedFamily[volumeFamily.name] = true;
	}

	let url = new URL($page.url);

	$: url = new URL($page.url);

	$: {
		if (Object.values(selectedFamily).every((v) => v)) {
			activeTrades = [...data.trades];
		} else {
			let newActiveTrades: DashboardTrade[] = [];
			data.trades.forEach((t) => filterByWhatever(t, newActiveTrades, $familySource));
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
		return Object.values(selectedFamily).every((v) => v);
	}
	function updateActiveTrades() {
		if (isAllSelected()) {
			activeTrades = [...data.trades];
		} else {
			let newActiveTrades: DashboardTrade[] = [];
			data.trades.forEach((t) => filterByWhatever(t, newActiveTrades, $familySource));
			activeTrades = newActiveTrades;
		}
	}

	function filterByWhatever(trade: DashboardTrade, coll: Array<DashboardTrade>, _s: unknown) {
		const familyPropName =
			familyTypes.get($familySource) ||
			function (tr: DashboardTrade) {
				return tr.volumeFamily;
			};
		const familyName = familyPropName(trade);
		if (familyName && selectedFamily[familyName]) {
			coll.push(trade);
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
	<IntervalDateControl {url} oneLiner={true} />
</h4>
<p>
	<FormField>
		<Radio
			bind:group={$familySource}
			value={FamilySource.Cmc}
			disabled={$familySource === FamilySource.Cmc} />
		<span slot="label"> MarketCap </span>
	</FormField>
	<FormField>
		<Radio
			bind:group={$familySource}
			value={FamilySource.Volume}
			disabled={$familySource === FamilySource.Volume} />
		<span slot="label"> Volume </span>
	</FormField>

	<span class="material-icons separator">minimize</span>
	{#each VolumeFamilies as family}
		<FormField>
			<Checkbox bind:checked={selectedFamily[family.name]} on:input={updateActiveTrades} />
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

	.separator {
		opacity: 0.6;
		margin-left: 0.5rem;
	}
</style>
