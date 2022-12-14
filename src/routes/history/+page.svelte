<script lang="ts">
	import { parseMonthStringOrNow } from '$lib/dates';
	import { FamilySource, familySource } from '$lib/stores/familySource';
	import type { PnlPerType } from '$lib/types/PnlPerType';
	import { getFamilyLabel } from '$lib/volumeReference';
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
	import type { PageData } from './$types';
	import { computePnlPerType, type PnlPerVol } from './helpers';

	export let data: PageData;

	let period: string = '';

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };

	let activeTab = $familySource;
	let showNegativePnL = false;
	let pnlPerVol: PnlPerVol[] = [];
	let pnlPerType: PnlPerType[] = [];

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

		// results formatting
		pnlPerVol = [...data.pnlPerVol];
		pnlPerVol.sort((a, b) => b.pnl - a.pnl);
		pnlPerType = computePnlPerType(data.pnlPerType, showNegativePnL);
	}

	function getLabel(tab: FamilySource) {
		if (tab === 'cmc') {
			return 'PnL per MarketCap family';
		}
		return 'PnL per volume family';
	}
</script>

<svelte:head>
	<title>History - overiew</title>
</svelte:head>

<div class="head-container">
	<h1>
		{period}
	</h1>
	<div class="head-date-picker">
		<Button href="/history?period={prevPeriod.machine}">
			<Icon class="material-icons">chevron_left</Icon>
			<Label>{prevPeriod.human}</Label>
		</Button>
		<Button href="/history?period={nextPeriod.machine}">
			<Label>{nextPeriod.human}</Label>
			<Icon class="material-icons">chevron_right</Icon>
		</Button>
	</div>
</div>

<Paper>
	<TabBar tabs={['cmc', 'volume']} let:tab bind:active={activeTab}>
		<!-- Note: the `tab` property is required! -->
		<Tab {tab}>
			<Label>{getLabel(tab)}</Label>
		</Tab>
	</TabBar>
	{#if activeTab === FamilySource.Cmc}
		<DataTable style="width: 100%;">
			<Head>
				<Row>
					<Cell columnId="cmcFamily">
						<Label>MarketCap family</Label>
					</Cell>
					<Cell columnId="totalPnl">
						<Label>PnL</Label>
					</Cell>
					<Cell columnId="PnlPerTrade">
						<Label>Pnl per trade</Label>
					</Cell>
					<Cell columnId="tradeCount">
						<Label>Trade Count</Label>
					</Cell>
				</Row>
			</Head>
			<Body>
				{#each data.pnlPerCmc as { cmcFamily, netPnl, tradeCount }}
					<Row>
						<Cell>
							{cmcFamily}
						</Cell>
						<Cell>
							$<Pnl pnl={netPnl} />
						</Cell>
						<Cell>
							$<Pnl pnl={netPnl / tradeCount} />
						</Cell>
						<Cell>
							{tradeCount}
						</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
		<div>
			<a href="/history/v">More...</a>
		</div>
	{:else}
		<DataTable style="width: 100%;">
			<Head>
				<Row>
					<Cell columnId="volumeFamily">
						<Label>Volume family</Label>
					</Cell>
					<Cell columnId="totalPnl">
						<Label>PnL</Label>
					</Cell>
					<Cell columnId="PnlPerTrade">
						<Label>Pnl per trade</Label>
					</Cell>
					<Cell columnId="tradeCount">
						<Label>Trade Count</Label>
					</Cell>
				</Row>
			</Head>
			<Body>
				{#each pnlPerVol as { family, pnl, pnlPerTrade, tradeCount }}
					<Row>
						<Cell>
							{getFamilyLabel(family)}
						</Cell>
						<Cell>
							$<Pnl {pnl} />
						</Cell>
						<Cell>
							$<Pnl pnl={pnlPerTrade} />
						</Cell>
						<Cell>
							{tradeCount}
						</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
		<div>
			<a href="/history/v">More...</a>
		</div>
	{/if}
</Paper><br /><Paper>
	<h3>PnL per watcher type <MoreLink href="/history/t" /></h3>
	<FormField align="end">
		<Switch bind:checked={showNegativePnL} />
		<span slot="label">Show negative PnL</span>
	</FormField>
	<br />
	<DataTable>
		<Head>
			<Row>
				<Cell columnId="watcherType">
					<Label>Watcher type</Label>
				</Cell>
				<Cell columnId="totalPnl">
					<Label>PnL</Label>
				</Cell>
				<Cell columnId="tradeCount">
					<Label>Trade Count</Label>
				</Cell>
			</Row>
		</Head>
		<Body>
			{#each pnlPerType as typeRes}
				<Row>
					<Cell>{typeRes._id}</Cell>
					<Cell>$<Pnl pnl={typeRes.pnl} /></Cell>
					<Cell>{typeRes.tradeCount}</Cell>
				</Row>
			{/each}
		</Body>
	</DataTable>
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

	h3 {
		margin-top: 0;
	}
</style>
