<script lang="ts">
	import { parseMonthStringOrNow } from '$lib/dates';
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Accordion, { Content, Header, Panel } from '@smui-extra/accordion';
	import Button from '@smui/button';
	import FormField from '@smui/form-field';
	import IconButton, { Icon } from '@smui/icon-button';
	import Paper from '@smui/paper';
	import Switch from '@smui/switch';
	import { add, format } from 'date-fns';
	import VolumeSuccessRate from './VolumeSuccessRate.svelte';
	import { perTradeType, type PerTradeTypeResponse } from './_helper';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradeRecordClient[]; period: string };

	let panelOpened: Record<string, boolean> = {};

	let history: PerTradeTypeResponse[] = [];
	let onlyPositivePnl = false;

	let period: string = '';
	let pnlPerTrade = true;

	let prevPeriod: { human: string; machine: string } = { human: '', machine: '' };
	let nextPeriod: { human: string; machine: string } = { human: '', machine: '' };
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

		//
		// results formatting
		//
		history = perTradeType(data.trades);

		if (pnlPerTrade) {
			history = history.sort((a, b) => b.pnlPerTrade - a.pnlPerTrade);
			if (onlyPositivePnl) {
				history = history.filter((h) => h.pnlPerTrade > 0);
			}
		} else {
			// sort hitory by pnl, highest first
			history = history.sort((a, b) => b.pnl - a.pnl);
			if (onlyPositivePnl) {
				history = history.filter((h) => h.pnl > 0);
			}
		}
	}
</script>

<Paper>
	<div class="head-container">
		<h1>
			{period}
		</h1>
		<div class="head-date-picker">
			<Button href="/history/t?period={prevPeriod.machine}">{prevPeriod.human}</Button>
			<Button href="/history/t?period={nextPeriod.machine}">{nextPeriod.human}</Button>
		</div>
	</div>
	<FormField align="end">
		<Switch bind:checked={pnlPerTrade} />
		<span slot="label">PnL per Trade</span>
	</FormField>
	<FormField align="end">
		<Switch bind:checked={onlyPositivePnl} />
		<span slot="label">Only show positive PnL</span>
	</FormField>

	<Accordion multiple>
		{#each history as type}
			<Panel bind:open={panelOpened[type.type]}>
				<Header>
					{#if pnlPerTrade}
						<span> $<Pnl pnl={type.pnlPerTrade} /> per trade</span>
					{:else}
						<span> $<Pnl pnl={type.pnl} /> - {type.tradeCount} trades</span>
					{/if}
					<span slot="description" class="primary"
						>{type.type}
						<a href="/history/t/{type.watcher.type}/{type.watcher.config}">more...</a></span>

					<IconButton slot="icon" toggle pressed={panelOpened[type.type]}>
						<Icon class="material-icons" on>expand_less</Icon>
						<Icon class="material-icons">expand_more</Icon>
					</IconButton>
				</Header>
				<Content>
					<VolumeSuccessRate {type} />
				</Content>
			</Panel>
		{/each}
	</Accordion>
</Paper>

<style>
	.primary {
		color: #fbc02d;
	}

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
