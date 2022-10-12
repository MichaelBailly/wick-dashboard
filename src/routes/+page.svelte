<script lang="ts">
	import type { PnlPerDay } from '$lib/server/db/trades';
	import PnlFamilyPerMonth from '$lib/widgets/PnlFamilyPerMonth.svelte';
	import PnlPerDayGraph from './PnlPerDayGraph.svelte';

	/** @type {import('./$types').PageData} */
	export let data: { pnlPerDay: PnlPerDay[] };

	let months = 2;
</script>

<svelte:head>
	<title>Overiew</title>
</svelte:head>

<p>
	<PnlPerDayGraph pnlPerDay={data.pnlPerDay} />
</p>
<PnlFamilyPerMonth {months} />

<style>
	p {
		width: 100%;
		display: flex;
		justify-content: center;
	}
</style>
