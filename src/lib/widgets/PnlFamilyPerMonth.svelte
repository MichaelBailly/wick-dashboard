<script lang="ts">
	import { getFamilyLabel } from '$lib/volumeReference';
	import DataTable, { Body, Cell, Head, Label } from '@smui/data-table';
	import Row from '@smui/data-table/src/Row.svelte';
	import Paper from '@smui/paper';
	import { onMount } from 'svelte';
	import Pnl from './Pnl.svelte';

	type PositiveNetPnls = {
		volumeFamilyId: string;
		netPnl: number;
		details: { month: string; familyId: string; netPnl: number }[];
	}[];

	let families: Array<{
		watcher: { type: string; config: string };
		positiveNetPnls: PositiveNetPnls;
	}> = [];

	let composedData: Array<{
		watcher: { type: string; config: string };
		families: string[];
		netPnl: number[];
		positiveNetPnls: PositiveNetPnls;
	}> = [];

	let months: string[] = [];

	$: {
		composedData = [];
		if (families.length) {
			const fam = families[0];
			months = fam.positiveNetPnls[0].details.map((d) => d.month);

			for (const family of families) {
				const perMonthPnl: number[] = [];
				for (const posNetPnl of family.positiveNetPnls) {
					posNetPnl.details.forEach((d, i) => {
						perMonthPnl[i] = perMonthPnl[i] ? perMonthPnl[i] + d.netPnl : d.netPnl;
					});
				}
				const composed = {
					watcher: family.watcher,
					families: family.positiveNetPnls.map((p) => p.volumeFamilyId),
					netPnl: perMonthPnl,
					positiveNetPnls: family.positiveNetPnls
				};
				composedData.push(composed);
			}
		}
	}

	onMount(async () => {
		const response = await fetch('/api/volumeFamilyPnl');
		families = await response.json();
	});
</script>

<Paper>
	<h3>Best winning family combinations over the months</h3>

	<DataTable style="width: 100%;">
		<Head>
			<Row>
				<Cell columnId="Watcher">
					<Label>Watcher</Label>
				</Cell>
				<Cell columnId="volumeFamily">
					<Label>Volume families</Label>
				</Cell>
				{#each months as month}
					<Cell columnId={month}>
						<Label>{month}</Label>
					</Cell>
				{/each}
			</Row>
		</Head>
		<Body>
			{#each composedData as family}
				<Row>
					<Cell>
						<a href="/history/t/{family.watcher.type}/{family.watcher.config}">
							{family.watcher.type}
							{family.watcher.config}
						</a>
					</Cell>
					<Cell>
						{family.families.map((f) => getFamilyLabel(f)).join(', ')}
					</Cell>
					{#each family.netPnl as pnl}
						<Cell>
							<Pnl {pnl} />
						</Cell>
					{/each}
				</Row>
			{/each}
		</Body>
	</DataTable>
</Paper>
