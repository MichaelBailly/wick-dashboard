<script lang="ts">
	import type { TradesHistoryResponse } from '$lib/types/TradesHistoryResponse';
	import Pnl from '$lib/widgets/Pnl.svelte';
	import Accordion, { Content, Header, Panel } from '@smui-extra/accordion';
	import FormField from '@smui/form-field';
	import IconButton, { Icon } from '@smui/icon-button';
	import Paper from '@smui/paper';
	import Switch from '@smui/switch';
	import { perTradeType, type PerTradeTypeResponse } from './_helper';

	/** @type {import('./$types').PageData} */
	export let data: { trades: TradesHistoryResponse };

	let panelOpened: Record<string, boolean> = {};
	let panelOpen = false;

	let history: PerTradeTypeResponse = [];
	let onlyPositivePnl = false;
	$: {
		history = perTradeType(data.trades);
		if (onlyPositivePnl) {
			history = history.filter((h) => h.pnl > 0);
		}
	}
</script>

<Paper>
	<FormField align="end">
		<Switch bind:checked={onlyPositivePnl} />
		<span slot="label">Only show positive PnL</span>
	</FormField>

	<Accordion multiple>
		{#each history as type}
			<Panel bind:open={panelOpened[type.type]}>
				<Header>
					<span> <Pnl pnl={type.pnl} />$ - {type.tradeCount} trades</span>
					<span slot="description" class="primary"
						>{type.type}
						<a href="/history/type/{type.watcher.type}/{type.watcher.config}">more...</a></span
					>

					<IconButton slot="icon" toggle pressed={panelOpened[type.type]}>
						<Icon class="material-icons" on>expand_less</Icon>
						<Icon class="material-icons">expand_more</Icon>
					</IconButton>
				</Header>
				<Content>
					{#each type.history as day}
						<span>
							{day.date}: <Pnl pnl={day.pnl} /> - {day.trades.length} trades
						</span>
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

	.text {
		color: #ddd;
	}
</style>
