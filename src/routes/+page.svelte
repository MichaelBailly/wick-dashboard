<script lang="ts">
	import { page } from '$app/stores';
	import { FEE_PER_TRADE } from '$lib/constants.client';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import TradesTable from '$lib/widgets/TradesTable.svelte';
	import Accordion, { Content as AContent, Header, Panel } from '@smui-extra/accordion';
	import Button from '@smui/button';
	import IconButton, { Icon } from '@smui/icon-button';
	import Paper, { Content } from '@smui/paper';
	import { add, format } from 'date-fns';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradeRecordClient[] };
	let tradeAccordionOpen: boolean = false;

	let date: Date;
	let yesterday: string;
	let tomorrow: string;
	let todaysTrades: TradeRecordClient[];
	let todaysPnl: number;
	let todaysFees: number;
	let todaysPnlPerWatcher: { type: string; config: string; pnl: number; count: number }[] = [];

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

		todaysTrades = data.trades;
		todaysPnl = todaysTrades.reduce((acc: number, t: TradeRecordClient) => acc + t.pnl, 0);
		todaysFees = todaysTrades.length * FEE_PER_TRADE;
		for (const t of todaysTrades) {
			const watcher = todaysPnlPerWatcher.find(
				(w) => w.type === t.watcher.type && w.config === t.watcher.config
			);
			if (watcher) {
				watcher.pnl += t.pnl;
				watcher.count++;
			} else {
				todaysPnlPerWatcher.push({
					type: t.watcher.type,
					config: t.watcher.config,
					pnl: t.pnl,
					count: 1
				});
			}
		}
		// sort by pnl
		todaysPnlPerWatcher.sort((a, b) => b.pnl - a.pnl);
	}

	function toHuman(date: Date | number) {
		return format(date, 'MMM dd, yyyy');
	}
</script>

<Paper>
	<Content>
		<h1>
			{toHuman(date)}
			<small>
				<Button href="/?date={yesterday}">{yesterday}</Button>
				<Button href="/?date={tomorrow}">{tomorrow}</Button>
			</small>
		</h1>
		<div class="summary-container">
			<div class="summary-total-pnl">
				PNL<br />
				<div><Pnl pnl={todaysPnl - todaysFees} />$</div>
				<div>
					<small class="small">
						${Math.trunc(todaysPnl * 100) / 100}, ${Math.trunc(todaysFees * 100) / 100} fees
						<br />
						{todaysTrades.length} trades
					</small>
				</div>
			</div>
			<div class="summary-info">
				{#each todaysPnlPerWatcher as w}
					<div>
						{w.type}
						{w.config}: <Pnl pnl={w.pnl} />
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
</style>
