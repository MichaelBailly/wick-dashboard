<script lang="ts">
	import type { DashboardTrade } from '$lib/types/DashboardTrade';
	import { getReference } from '$lib/volumeReference';

	export let trades: DashboardTrade[];

	import {
		CategoryScale,
		Chart,
		Filler,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		Tooltip
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	// import date-fns locale:
	import { onMount } from 'svelte';

	const volReference = getReference();

	let canvas: HTMLCanvasElement;
	Chart.register(
		LineController,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Tooltip,
		Legend,
		Filler
	);

	Chart.defaults.backgroundColor = 'rgba(0,0,0,1)';
	Chart.defaults.borderColor = 'rgba(0,0,0,1)';
	Chart.defaults.color = 'rgba(200,200,200,0.9)';

	let chart: Chart;

	$: {
		if (chart) {
			chart.data.datasets[0].data = getGraphData(trades);
			chart.update();
		}
	}

	onMount(async () => {
		const zoomModule = await import('chartjs-plugin-zoom');
		Chart.register(zoomModule.default);

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
						type: 'line',
						label: 'Success Rate per Asset Monthly Volume',
						data: getGraphData(trades),
						backgroundColor: 'rgb(0, 131, 143)',
						borderColor: 'rgba(0, 131, 143, 0.5)',
						borderWidth: 2,
						cubicInterpolationMode: 'monotone',
						tension: 0.4,
						yAxisID: 'y',
						order: 1,
						fill: {
							target: 'origin',
							above: 'rgba(0, 131, 143, 0.1)'
						}
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					x: {
						type: 'linear',
						title: {
							display: true,
							text: 'Date'
						},
						grid: {
							// drawBorder: false,
							color: 'rgba(30,30,30, 0.6)'
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
					legend: {
						display: true,
						labels: {
							color: 'rgba(200,200,200,0.9)'
						}
					},
					zoom: {
						zoom: {
							wheel: {
								enabled: true
							},
							pinch: {
								enabled: true
							},
							drag: {
								enabled: true
							},
							mode: 'x'
						}
					}
				}
			}
		});
	});

	function getGraphData(trades: DashboardTrade[]) {
		const graphData = [];
		const map: Map<number, boolean[]> = new Map();
		for (const trade of trades) {
			const volUsdt = volReference.find((v) => v.pair === trade.pair)?.volUsdt;
			if (!volUsdt) {
				continue;
			}
			let successRate = map.get(volUsdt) || [];
			successRate.push(trade.netPnl > 0 ? true : false);
			map.set(volUsdt, successRate);
		}

		for (const [volUsdt, successRate] of map) {
			const successRatePct =
				Math.round(
					(successRate.filter((s) => s).length / successRate.length + Number.EPSILON) * 100
				) / 100;
			graphData.push({ x: volUsdt, y: successRatePct });
		}

		graphData.sort((a, b) => a.x - b.x);

		return graphData;
	}
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
