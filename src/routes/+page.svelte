<script lang="ts">
	import { page } from '$app/stores';
	import type { PnlPerDay } from '$lib/server/db/trades';
	import IntervalDateControl from '$lib/widgets/IntervalDateControl.svelte';
	import PnlFamilyPerMonth from '$lib/widgets/PnlFamilyPerMonth.svelte';
	import PnlPerDayGraph from './PnlPerDayGraph.svelte';

	/** @type {import('./$types').PageData} */
	export let data: { pnlPerDay: PnlPerDay[] };

	let url = new URL($page.url);
	$: {
		url = new URL($page.url);
		url.searchParams.forEach((value, key) => url.searchParams.delete(key));
	}

	let months = 3;
</script>

<svelte:head>
	<title>Overiew</title>
</svelte:head>

<div class="graph-container">
	<div class="control-container">
		<PnlPerDayGraph pnlPerDay={data.pnlPerDay} />
		<IntervalDateControl {url} oneLiner={true} controlSpace={true} />
	</div>
</div>
<PnlFamilyPerMonth {months} />

<style>
	:root {
		--control-bg-color: rgba(51, 51, 64, 0.6);
	}

	.graph-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.control-container {
		flex-shrink: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border: 2px solid var(--control-bg-color);
		margin-bottom: 2rem;
	}
</style>
