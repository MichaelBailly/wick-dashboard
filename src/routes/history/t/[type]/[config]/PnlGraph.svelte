<script lang="ts">
	import type { DashboardTrade } from '$lib/types/DashboardTrade';

	export let trades: DashboardTrade[];

	import {
		BarController,
		BarElement,
		CategoryScale,
		Chart,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		ScatterController,
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
		Legend,
		ScatterController,
		BarController,
		BarElement
	);

	Chart.defaults.backgroundColor = 'rgba(0,0,0,1)';
	Chart.defaults.borderColor = 'rgba(0,0,0,1)';
	Chart.defaults.color = 'rgba(200,200,200,0.9)';

	let chart: Chart;
	let { pnl, cumulatedPnl, trades: sortedTrades } = getTradesGraphData(trades);

	$: {
		if (chart) {
			const out = getTradesGraphData(trades);
			pnl = out.pnl;
			cumulatedPnl = out.cumulatedPnl;
			sortedTrades = out.trades;

			// @ts-ignore
			chart.data.datasets[0].data = pnl;
			// @ts-ignore
			chart.data.datasets[1].data = cumulatedPnl;

			chart.update();
		}
	}

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		// @ts-ignore
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				datasets: [
					{
						type: 'bar',
						label: 'Pnl',
						data: pnl,
						backgroundColor: 'rgb(196, 144, 0)',
						borderColor: 'rgba(196, 144, 0, 0.5)',
						borderWidth: 2,
						yAxisID: 'y2',
						order: 2
					},
					{
						type: 'line',
						label: 'Cumulated Pnl',
						data: cumulatedPnl,
						backgroundColor: 'rgb(0, 131, 143)',
						borderColor: 'rgba(0, 131, 143, 0.5)',
						borderWidth: 2,
						cubicInterpolationMode: 'monotone',
						tension: 0.4,
						yAxisID: 'y',
						order: 1
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					x: {
						// @ts-ignore
						type: 'time',
						distribution: 'linear',
						title: {
							display: true,
							text: 'Date'
						},
						grid: {
							// drawBorder: false,
							color: 'rgba(30,30,30, 0.6)'
						},
						adapters: {
							date: {
								locale: enUS
							}
						}
					},
					y2: {
						ticks: {
							color: 'rgb(196, 144, 0)'
						},
						grid: {
							drawBorder: false,
							color: function (context) {
								if (context.tick.value !== 0) {
									return 'rgba(30,30,30, 0.6)';
								}

								return 'rgba(196, 144, 0, 0.35)';
							}
						}
					},
					y: {
						type: 'linear',
						display: true,
						position: 'right',
						ticks: {
							color: 'rgb(0, 131, 143)'
						},
						grid: {
							color: function (context) {
								if (context.tick.value !== 0) {
									return 'rgba(30,30,30, 0)';
								}

								return 'rgba(0, 131, 143, 0.35)';
							},
							drawBorder: false
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
							color: 'rgba(200,200,200,0.9)'
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
		background-color: rgb(51, 51, 64);
		padding: 1rem;
		width: 1024px;
		height: 300px;
		position: relative;
	}
</style>
