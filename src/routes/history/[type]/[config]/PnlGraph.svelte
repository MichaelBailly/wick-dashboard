<script lang="ts">
	import type { TradeRecordClient } from '$lib/types/TradeRecordClient';

	export let trades: TradeRecordClient[];

	import {
		CategoryScale,
		Chart,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		TimeScale,
		Tooltip
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import { formatDistance } from 'date-fns';
	// import date-fns locale:
	import { enUS } from 'date-fns/locale';
	import { onMount } from 'svelte';
	import { getTradesGraphData } from './helpers';

	let canvas: HTMLCanvasElement;
	Chart.register(
		LineController,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		TimeScale,
		Tooltip,
		Legend
	);

	const { pnl, cumulatedPnl, trades: sortedTrades } = getTradesGraphData(trades);

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				datasets: [
					{
						label: 'Pnl',
						data: pnl,
						backgroundColor: '#c49000',
						borderColor: 'rgba(0,0,0, 0.4)',
						borderWidth: 1
					},
					{
						label: 'Cumulated Pnl',
						data: cumulatedPnl,
						backgroundColor: '#00838f',
						borderColor: 'rgba(0,0,0, 0.4)',
						borderWidth: 1
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					x: {
						type: 'time',
						distribution: 'linear',
						title: {
							display: true,
							text: 'Date'
						},
						adapters: {
							date: {
								locale: enUS
							}
						}
					}
				},
				plugins: {
					tooltip: {
						usePointStyle: true,
						callbacks: {
							labelPointStyle: function () {
								return {
									pointStyle: 'triangle',
									rotation: 0
								};
							},
							afterLabel: ({ dataIndex }) => {
								return formatDistance(
									sortedTrades[dataIndex].soldTimestamp,
									sortedTrades[dataIndex].boughtTimestamp
								);
							},
							afterTitle: (context) => {
								return sortedTrades[context[0].dataIndex].pair;
							}
						}
					},
					legend: {
						display: true,
						labels: {
							color: '#333'
						}
					}
				}
			}
		});
	});
</script>

<div class="canvas-container">
	<canvas bind:this={canvas} />
</div>

<style>
	.canvas-container {
		background-color: white;
		padding: 1rem;
		width: 1024px;
		height: 300px;
		position: relative;
	}
</style>
