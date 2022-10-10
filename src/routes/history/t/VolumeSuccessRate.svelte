<script lang="ts">
	import Pnl from '$lib/widgets/Pnl.svelte';
	import type { PerTradeTypeResponse } from './_helper';

	export let type: PerTradeTypeResponse;

	let volumeAnalyses: Map<string, any>;
	let pnlPerVolumeFamily: any[] = [];
	$: {
		volumeAnalyses = new Map();
		type.history.forEach((day) => {
			day.trades.forEach((trade) => {
				const family = trade.volumeFamily;
				if (!family) {
					return;
				}

				let analyses = volumeAnalyses.get(family);
				if (!analyses) {
					analyses = {
						count: 0,
						pnl: 0
					};
					volumeAnalyses.set(family, analyses);
				}
				analyses.count++;
				analyses.pnl += trade.netPnl;
			});
		});

		pnlPerVolumeFamily = Array.from(volumeAnalyses.entries())
			.map(([family, analyses]) => {
				return {
					family,
					pnl: analyses.pnl,
					count: analyses.count,
					avgPnl: analyses.count === 0 ? 0 : analyses.pnl / analyses.count
				};
			})
			.sort((a, b) => b.avgPnl - a.avgPnl);
	}
</script>

{#each pnlPerVolumeFamily as volumeFamily}
	<div>
		{volumeFamily.family}: Avg $<Pnl pnl={volumeFamily.avgPnl} /> ($<Pnl pnl={volumeFamily.pnl} /> in
		{volumeFamily.count}
		trades)
	</div>
{/each}
