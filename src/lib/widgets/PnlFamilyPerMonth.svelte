<script lang="ts">
	import { toMonthString } from '$lib/dates';
	import { FamilySource, familySource } from '$lib/stores/familySource';
	import type { StrategyFamilyMonthPnl } from '$lib/types/StrategyFamilyMonthPnl';
	import type { Watcher } from '$lib/types/Watcher';
	import { getFamilyLabel } from '$lib/volumeReference';
	import DataTable, { Body, Cell, Head, Label } from '@smui/data-table';
	import Row from '@smui/data-table/src/Row.svelte';
	import FormField from '@smui/form-field';
	import LinearProgress from '@smui/linear-progress';
	import Paper from '@smui/paper';
	import Radio from '@smui/radio';
	import Select, { Option } from '@smui/select';
	import { setDate, sub } from 'date-fns';
	import { onMount } from 'svelte';
	import MoreLink from './MoreLink.svelte';
	import Pnl from './Pnl.svelte';

	export let months: number = 3;
	export let fetchImpl: FetchFunction = fetch;

	type ComposedItem = {
		watcher: Watcher;
		families: string[];
		netPnl: number[];
	};

	type FetchFunction = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

	type Families = StrategyFamilyMonthPnl[][];

	let families: Families = [];

	let monthsData: string[] = [];
	let composedData: ComposedItem[] = [];

	let mounted = false;
	let loaded = false;

	$: if (mounted) loadData(months, $familySource);
	$: composedData = getComposedData([...families]);

	function getComposedData(fam: Families) {
		const firstMonthData = fam.shift();
		const composed: ComposedItem[] = [];
		if (!firstMonthData) {
			return composed;
		}
		for (const sfPnl of firstMonthData) {
			const others = fam.map((f) =>
				f.find(
					(s) => s.type === sfPnl.type && s.config === sfPnl.config && s.family === sfPnl.family
				)
			);
			if (others.some((o) => o === undefined)) {
				continue;
			}
			let currentComposed: ComposedItem | undefined = composed.find(
				(c) => c.watcher.type === sfPnl.type && c.watcher.config === sfPnl.config
			);
			if (!currentComposed) {
				currentComposed = {
					watcher: {
						type: sfPnl.type,
						config: sfPnl.config
					},
					families: [],
					netPnl: monthsData.map(() => 0)
				};
				composed.push(currentComposed);
			}
			currentComposed.families.push(sfPnl.family);
			currentComposed.netPnl[0] += sfPnl.netPnl;
			for (let i = 1; i < months; i++) {
				// @ts-ignore
				currentComposed.netPnl[i] += others[i - 1].netPnl;
			}
		}
		composed.sort(
			(a, b) => b.netPnl.reduce((acc, n) => acc + n, 0) - a.netPnl.reduce((acc, n) => acc + n, 0)
		);
		return composed;
	}

	function loadData(monthLen: number, familyType: string) {
		loaded = false;
		const monthlist = monthList(monthLen);
		const ftype = familyType === 'cmc' ? 'cmc' : 'volume';
		const promises = monthlist.map((m) =>
			fetchImpl(`/api/sfByMonth?month=${m}&familyType=${ftype}`).then((r) => r.json())
		);

		Promise.all(promises).then((responses) => {
			if (monthLen === months) {
				families = responses;
				monthsData = monthlist;
				loaded = true;
			}
		});
	}

	function monthList(monthLen: number) {
		const today = setDate(new Date(), 2);
		const months = [];
		for (let i = 0; i < monthLen; i++) {
			months.push(toMonthString(sub(today, { months: i })));
		}
		return months.reverse();
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
			<Option value={4}>4</Option>
			<Option value={5}>5</Option>
		</Select>
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
