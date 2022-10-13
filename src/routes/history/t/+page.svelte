<script lang="ts">
	import { parseMonthStringOrNow } from '$lib/dates';
	import type { TypeHistorySummary } from '$lib/types/TypeHistorySummary';
	import { getFamilyLabel } from '$lib/volumeReference';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Accordion, { Content, Header, Panel } from '@smui-extra/accordion';
	import Button, { Label } from '@smui/button';
	import FormField from '@smui/form-field';
	import IconButton, { Icon } from '@smui/icon-button';
	import Paper from '@smui/paper';
	import Switch from '@smui/switch';
	import { add, format } from 'date-fns';

	/** @type {import('./$types').PageData} */
	export let data: { typeHistorySummaries: TypeHistorySummary[]; period: string };
	let panelOpened: Record<string, boolean> = {};

	let history: TypeHistorySummary[] = [];
	let showNegativePnL = false;

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
		history = [...data.typeHistorySummaries];

		if (pnlPerTrade) {
			history = history.sort((a, b) => b.netPnl / b.tradeCount - a.netPnl / a.tradeCount);
		} else {
			// sort hitory by pnl, highest first
			history = history.sort((a, b) => b.netPnl - a.netPnl);
		}
		if (!showNegativePnL) {
			history = history.filter((h) => h.netPnl > 0);
		}
	}
</script>

<svelte:head>
	<title>History per Type - Overiew</title>
</svelte:head>

<div class="head-container">
	<h1>
		{period}
	</h1>
	<div class="head-date-picker">
		<Button href="/history/t?period={prevPeriod.machine}">
			<Icon class="material-icons">chevron_left</Icon>

			<Label>{prevPeriod.human}</Label></Button>
		<Button href="/history/t?period={nextPeriod.machine}">
			{nextPeriod.human}
			<Icon class="material-icons">chevron_right</Icon>
		</Button>
	</div>
</div>
<div class="ff-container">
	<FormField align="end">
		<Switch bind:checked={pnlPerTrade} />
		<span slot="label">PnL per Trade</span>
	</FormField>
	<FormField align="end">
		<Switch bind:checked={showNegativePnL} />
		<span slot="label">Also show negative PnL</span>
	</FormField>
</div>

<Paper>
	<Accordion multiple>
		{#each history as typeHistorySummary}
			<Panel
				bind:open={panelOpened[
					`${typeHistorySummary.watcher.type} ${typeHistorySummary.watcher.config}`
				]}>
				<Header>
					{#if pnlPerTrade}
						<span>
							$<Pnl pnl={typeHistorySummary.netPnl / typeHistorySummary.tradeCount} /> per trade</span>
					{:else}
						<span>
							$<Pnl pnl={typeHistorySummary.netPnl} /> - {typeHistorySummary.tradeCount} trades</span>
					{/if}
					<span slot="description" class="primary"
						>{typeHistorySummary.watcher.type}
						{typeHistorySummary.watcher.config}
						<a
							href="/history/t/{typeHistorySummary.watcher.type}/{typeHistorySummary.watcher
								.config}">more...</a
						></span>

					<IconButton
						slot="icon"
						toggle
						pressed={panelOpened[
							`${typeHistorySummary.watcher.type} ${typeHistorySummary.watcher.config}`
						]}>
						<Icon class="material-icons" on>expand_less</Icon>
						<Icon class="material-icons">expand_more</Icon>
					</IconButton>
				</Header>
				<Content>
					{#each typeHistorySummary.volumeFamilies as volumeFamily}
						<div>
							{getFamilyLabel(volumeFamily.volumeFamily)}:
							<Pnl pnl={volumeFamily.netPnl} /> in {volumeFamily.tradeCount} trades
						</div>
					{/each}
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

	.ff-container {
		padding-bottom: 1rem;
	}
</style>
