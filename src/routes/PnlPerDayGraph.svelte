<script lang="ts">
	import { goto } from '$app/navigation';
	import { getDateAtMidnightUTC } from '$lib/dates';
	import type { PnlPerDay } from '$lib/server/db/trades';

	export let pnlPerDay: PnlPerDay[];

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
		TimeScale,
		Tooltip
	} from 'chart.js';

	import 'chartjs-adapter-date-fns';
	import { format } from 'date-fns';
	// import date-fns locale:
	import { enUS } from 'date-fns/locale';
	import { onMount } from 'svelte';
	let canvas: HTMLCanvasElement;
	Chart.register(
		LineController,
		BarController,
		BarElement,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		TimeScale,
		Tooltip,
		Legend
	);

	Chart.defaults.backgroundColor = 'rgba(0,0,0,1)';
	Chart.defaults.borderColor = 'rgba(0,0,0,1)';
	Chart.defaults.color = 'rgba(200,200,200,0.9)';

	let chart: Chart;
	let { pnl, cumulatedPnl } = getTradesGraphData(pnlPerDay);

	$: {
		if (chart) {
			const out = getTradesGraphData(pnlPerDay);
			pnl = out.pnl;
			cumulatedPnl = out.cumulatedPnl;
			if (cumulatedPnl.length) {
				cumulatedPnl.unshift({
					y: 0,
					x: getDateAtMidnightUTC(cumulatedPnl[0].x)
				});
			}

			// @ts-ignore
			chart.data.datasets[0].data = pnl;
			// @ts-ignore
			chart.data.datasets[1].data = cumulatedPnl;
			chart.data.datasets[1].label = `Cumulated Pnl: $${cumulatedPnl[
				cumulatedPnl.length - 1
			]?.y.toFixed(2)}`;
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
						label: 'Daily PnL',
						data: pnl,
						backgroundColor: 'rgb(196, 144, 0)',
						borderColor: 'rgba(196, 144, 0, 0.5)',
						borderWidth: 2,
						yAxisID: 'y2',
						order: 2
					},
					{
						type: 'line',
						label: `Cumulated Pnl: $${cumulatedPnl[cumulatedPnl.length - 1]?.y.toFixed(2)}`,
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
							display: false,
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
						},
						time: {
							unit: 'day'
						}
					},
					y2: {
						ticks: {
							color: 'rgb(196, 144, 0)'
						},
						grid: {
							color: function (context) {
								if (context.tick.value !== 0) {
									return 'rgba(30,30,30, 0.6)';
								}

								return 'rgba(196, 144, 0, 0.35)';
							}
						},
						border: {
							display: false
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
							}
						},
						border: {
							display: false
						}
					}
				},
				plugins: {
					tooltip: {
						usePointStyle: true,
						callbacks: {
							title: function (tooltipItem) {
								return format((tooltipItem[0] as { raw: { x: Date } }).raw.x, 'MMM d, yyyy');
							}
						}
					},
					legend: {
						display: true,
						labels: {
							color: 'rgba(200,200,200,0.9)'
						}
					}
				},
				onClick: (e) => {
					if (!chart) {
						return;
					}
					// @ts-ignore
					const points = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);

					if (points.length) {
						const firstPoint = points[0];
						const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
						// @ts-ignore
						if (!value || !value.x || typeof value.x !== 'object') {
							return;
						}
						const date = format(
							// @ts-ignore
							chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index].x,
							'yyyy-MM-dd'
						);
						goto(`/daily?date=${date}`);
					}
				},
				interaction: {
					mode: 'x'
				}
			}
		});
	});

	function getTradesGraphData(pnlPerDay: PnlPerDay[]): {
		cumulatedPnl: { x: Date; y: number }[];
		pnl: { x: Date; y: number }[];
	} {
		let aggregatePnlValue = 0;
		const cumulatedPnl: { x: Date; y: number }[] = [];
		const pnl = pnlPerDay.map((p) => {
			const dateSplit = p._id.split('-');
			const date = new Date(
				parseInt(dateSplit[0]),
				parseInt(dateSplit[1]) - 1,
				parseInt(dateSplit[2])
			);

			aggregatePnlValue += p.netPnl;

			cumulatedPnl.push({
				x: date,
				y: aggregatePnlValue
			});

			return {
				x: date,
				y: p.netPnl
			};
		});

		return {
			cumulatedPnl,
			pnl
		};
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
