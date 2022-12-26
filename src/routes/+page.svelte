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

<p>
	<IntervalDateControl {url} />
	<PnlPerDayGraph pnlPerDay={data.pnlPerDay} />
</p>
<PnlFamilyPerMonth {months} />

<style>
	p {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
