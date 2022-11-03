<script lang="ts">
	import { getFamilyLabel } from '$lib/volumeReference';
	import DataTable, { Body, Cell, Head, Label } from '@smui/data-table';
	import Row from '@smui/data-table/src/Row.svelte';
	import LinearProgress from '@smui/linear-progress';
	import Paper from '@smui/paper';
	import Select, { Option } from '@smui/select';
	import { onMount } from 'svelte';
	import MoreLink from './MoreLink.svelte';
	import Pnl from './Pnl.svelte';

	export let months: number = 2;

	type PositiveNetPnls = {
		volumeFamilyId: string;
		netPnl: number;
		details: { month: string; familyId: string; netPnl: number }[];
	}[];

	type Family = {
		watcher: { type: string; config: string };
		positiveNetPnls: PositiveNetPnls;
	};

	type ComposedData = {
		watcher: { type: string; config: string };
		families: string[];
		netPnl: number[];
		positiveNetPnls: PositiveNetPnls;
	};

	let families: Family[] = [];

	let composedData: ComposedData[] = [];

	let monthsData: string[] = [];

	let mounted = false;
	let loaded = false;

	$: if (mounted) loadData(months);

	$: {
		composedData = [];
		if (families.length) {
			const fam = families[0];
			monthsData = fam.positiveNetPnls[0].details.map((d) => d.month);

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

	function composeData(families: Family[]) {
		const composedData: ComposedData[] = [];
		if (!families.length) {
			return composedData;
		}
		const fam = families[0];
		monthsData = fam.positiveNetPnls[0].details.map((d) => d.month);

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
		return composedData;
	}

	async function loadData(monthLen: number) {
		loaded = false;
		const response = await fetch(`/api/volumeFamilyPnl?months=${monthLen}`);
		families = await response.json();
		loaded = true;
	}

	onMount(() => {
		mounted = true;
	});
</script>

<Paper>
	<h3>Best winning family combinations over the months</h3>
	<p>
		<Select bind:value={months} label="Number of months">
			<Option value={2}>2</Option>
			<Option value={3}>3</Option>
		</Select>
	</p>

	<DataTable style="width: 100%;">
		<Head>
			<Row>
				<Cell columnId="Watcher">
					<Label>Watcher</Label>
				</Cell>
				<Cell columnId="volumeFamily">
					<Label>Volume families</Label>
				</Cell>
				{#each monthsData as month}
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
						{family.watcher.type}
						{family.watcher.config}
						<MoreLink href="/history/t/{family.watcher.type}/{family.watcher.config}" />
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
		<LinearProgress
			indeterminate
			bind:closed={loaded}
			aria-label="Data is being loaded..."
			slot="progress" />
	</DataTable>
</Paper>
