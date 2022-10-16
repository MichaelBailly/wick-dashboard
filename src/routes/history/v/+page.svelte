<script lang="ts">
	import { parseMonthStringOrNow } from '$lib/dates';
	import MoreLink from '$lib/widgets/MoreLink.svelte';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Button, { Icon } from '@smui/button';
	import DataTable, { Body, Cell, Head, Label, Row } from '@smui/data-table';
	import FormField from '@smui/form-field';
	import Paper from '@smui/paper';
	import Switch from '@smui/switch';
	import Tab from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { add, format } from 'date-fns';
	import type { BestGroup, PnlPerTypePerVolumeFamily } from './helper';

	/** @type {import('./$types').PageData} */
	export let data: {
		pnlPerType: PnlPerTypePerVolumeFamily[];
		bestGroupPerType: BestGroup[];
		period: string;
	};

	let period: string = '';

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };

	let showNegativePnL = false;
	let activeTab = 'single';
	const tabLabels = new Map([
		['single', 'Best family per type'],
		['combination', 'Best family combination per type']
	]);
	let pnlPerTypePerVolumeFamily: PnlPerTypePerVolumeFamily[] = [];
	let bestGroupPerType: BestGroup[] = [];

	$: {
		// dates navigation
		const [year, month] = parseMonthStringOrNow(data.period);
		const thisMonthDate = new Date(year, month - 1, 10);
		period = format(thisMonthDate, 'MMMM yyyy');
		const nextMonthDate = add(thisMonthDate, { months: 1 });
		const prevMonthDate = add(thisMonthDate, { months: -1 });
		prevPeriod = {
			human: format(prevMonthDate, 'MMMM yyyy'),
			machine: format(prevMonthDate, 'yyyy-MM')
		};
		nextPeriod = {
			human: format(nextMonthDate, 'MMMM yyyy'),
			machine: format(nextMonthDate, 'yyyy-MM')
		};

		// compute data
		// pnl per trade type per volume family

		pnlPerTypePerVolumeFamily = showNegativePnL
			? [...data.pnlPerType]
			: data.pnlPerType.filter((p) => p.pnl > 0);

		// compute
		// best group of families per type
		bestGroupPerType = [...data.bestGroupPerType];
	}
</script>

<svelte:head>
	<title>History per volume - overview</title>
</svelte:head>

<div class="head-container">
	<h1>
		{period}
	</h1>
	<div class="head-date-picker">
		<Button href="/history/v?period={prevPeriod.machine}">
			<Icon class="material-icons">chevron_left</Icon>
			<Label>{prevPeriod.human}</Label>
		</Button>
		<Button href="/history/v?period={nextPeriod.machine}">
			<Label>{nextPeriod.human}</Label>
			<Icon class="material-icons">chevron_right</Icon>
		</Button>
	</div>
</div>

<TabBar tabs={[...tabLabels.keys()]} let:tab bind:active={activeTab}>
	<Tab {tab}>
		<Label>{tabLabels.get(tab)}</Label>
	</Tab>
</TabBar>
<Paper>
	{#if activeTab === 'single'}
		<FormField align="end">
			<Switch bind:checked={showNegativePnL} />
			<span slot="label">Show negative PnL</span>
		</FormField>
		<br />
		<DataTable>
			<Head>
				<Row>
					<Cell columnId="volumeFamily"><Label>Family</Label></Cell>
					<Cell columnId="watcherType"><Label>Watcher</Label></Cell>
					<Cell columnId="pnl"><Label>PnL</Label></Cell>
					<Cell columnId="tradeCount"><Label>Trade Count</Label></Cell>
					<Cell columnId="details"><Label>Details</Label></Cell>
				</Row>
			</Head>
			<Body>
				{#each pnlPerTypePerVolumeFamily as pptpvf}
					<Row>
						<Cell>{pptpvf.volumeFamily}</Cell>
						<Cell>{pptpvf.watcher.type} {pptpvf.watcher.config}</Cell>
						<Cell><Pnl pnl={pptpvf.pnl} /></Cell>
						<Cell>{pptpvf.tradeCount}</Cell>
						<Cell>
							<MoreLink
								href="/history/t/{pptpvf.watcher.type}/{pptpvf.watcher
									.config}?period={data.period}" /></Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	{:else}
		<DataTable>
			<Head>
				<Row>
					<Cell columnId="volumeFamily"><Label>Family Combination</Label></Cell>
					<Cell columnId="watcherType"><Label>Watcher</Label></Cell>
					<Cell columnId="pnl"><Label>PnL</Label></Cell>
					<Cell columnId="details"><Label>Details</Label></Cell>
				</Row>
			</Head>
			<Body>
				{#each bestGroupPerType as best}
					<Row>
						<Cell>{best.families.join(', ')}</Cell>
						<Cell>{best.watcher.type} {best.watcher.config}</Cell>
						<Cell><Pnl pnl={best.pnl} /></Cell>
						<Cell>
							<MoreLink
								href="/history/t/{best.watcher.type}/{best.watcher
									.config}?period={data.period}" /></Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	{/if}
</Paper>

<style>
	.head-container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.head-date-picker {
		flex-grow: 1;
		padding: 0 2rem;
	}
</style>
