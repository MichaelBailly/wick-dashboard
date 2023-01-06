<script lang="ts">
	import { page } from '$app/stores';
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { VolumeFamilies } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import TradesTable from '$lib/widgets/TradesTable.svelte';
	import Accordion, { Content as AContent, Header, Panel } from '@smui-extra/accordion';
	import Button from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import IconButton, { Icon } from '@smui/icon-button';
	import Paper, { Content } from '@smui/paper';
	import { add, format } from 'date-fns';

	/** @type {import('./$types').PageData} */
	export let data: { trades: DashboardTrade[] };
	let tradeAccordionOpen: boolean = false;

	let date: Date;
	let yesterday: string;
	let tomorrow: string;
	let todaysTrades: DashboardTrade[];
	let todaysPnl: number;
	let todaysNetPnl: number;
	let todaysFees: number;
	let todaysPnlPerWatcher: { type: string; config: string; netPnl: number; count: number }[] = [];

	const checked: Record<string, boolean> = {};
	for (const family of VolumeFamilies) {
		checked[family.name] = true;
	}

	$: {
		todaysPnlPerWatcher = [];
		const dateStr = $page.url.searchParams.get('date');

		const dateSplit = dateStr ? dateStr.split('-') : [];

		if (dateSplit.length !== 3) {
			date = new Date();
		} else {
			date = new Date(parseInt(dateSplit[0]), parseInt(dateSplit[1]) - 1, parseInt(dateSplit[2]));
		}
		yesterday = format(add(date, { days: -1 }), 'yyyy-MM-dd');
		tomorrow = format(add(date, { days: 1 }), 'yyyy-MM-dd');

		todaysTrades = data.trades.filter((t) => checked[t.volumeFamily]);
		todaysPnl = todaysTrades.reduce((acc: number, t: DashboardTrade) => acc + t.pnl, 0);
		todaysNetPnl = todaysTrades.reduce((acc: number, t: DashboardTrade) => acc + t.netPnl, 0);
		todaysFees = todaysPnl - todaysNetPnl;
		for (const t of todaysTrades) {
			const watcher = todaysPnlPerWatcher.find(
				(w) => w.type === t.watcher.type && w.config === t.watcher.config
			);
			if (watcher) {
				watcher.netPnl += t.netPnl;
				watcher.count++;
			} else {
				todaysPnlPerWatcher.push({
					type: t.watcher.type,
					config: t.watcher.config,
					netPnl: t.netPnl,
					count: 1
				});
			}
		}
		// sort by pnl
		todaysPnlPerWatcher.sort((a, b) => b.netPnl - a.netPnl);
	}

	function toHuman(date: Date | number) {
		return format(date, 'MMM dd, yyyy');
	}
</script>

<svelte:head>
	<title>PnL - details per day</title>
</svelte:head>

<Paper>
	<Content>
		<h1>
			{toHuman(date)}
			<small>
				<Button href="/daily?date={yesterday}">{yesterday}</Button>
				<Button href="/daily?date={tomorrow}">{tomorrow}</Button>
			</small>
		</h1>
		<div class="summary-container">
			<div class="summary-total-pnl">
				PNL<br />
				<div>$<Pnl pnl={todaysNetPnl} /></div>
				<div>
					<small class="small">
						${Math.trunc(todaysFees * 100) / 100} fees
						<br />
						{todaysTrades.length} trades
					</small>
				</div>
				<div class="family-check-container">
					{#each VolumeFamilies as family}
						<FormField>
							<Checkbox bind:checked={checked[family.name]} />
							<span slot="label">{family.label}</span>
						</FormField>
					{/each}
				</div>
			</div>
			<div class="summary-info">
				{#each todaysPnlPerWatcher as w}
					<div>
						{w.type}
						{w.config}: <Pnl pnl={w.netPnl} />
						({w.count} trades) <a href="/history/t/{w.type}/{w.config}">more...</a>
					</div>
				{/each}
			</div>
		</div>
	</Content>
</Paper>

<div class="trades-table-container">
	<Accordion style="width: 80vw">
		<Panel bind:open={tradeAccordionOpen}>
			<Header>
				All trades
				<IconButton slot="icon" toggle pressed={tradeAccordionOpen}>
					<Icon class="material-icons" on>expand_less</Icon>
					<Icon class="material-icons">expand_more</Icon>
				</IconButton>
			</Header>
			<AContent>
				<TradesTable trades={todaysTrades} />
			</AContent>
		</Panel>
	</Accordion>
</div>

<style>
	.trades-table-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.summary-container {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-items: center;
	}
	.summary-total-pnl {
		font-size: 2rem;
		font-weight: bold;
		margin-right: 1rem;
		text-align: center;
		align-self: flex-start;
	}
	.summary-total-pnl > div {
		padding: 1rem 0;
	}

	.summary-info {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: start;
		margin-left: 2rem;
	}

	.small {
		font-size: 0.8rem;
	}

	.family-check-container {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: start;
	}
</style>
