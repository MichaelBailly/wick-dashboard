import type { DashboardTrade } from '$lib/types/DashboardTrade';

export function getTradesGraphData(trades: DashboardTrade[]) {
	const allTrades = [...trades];
	// sort allTrades by boughtTimestamp, older first
	allTrades.sort((a, b) => a.boughtTimestamp.getTime() - b.boughtTimestamp.getTime());

	const pnl: { x: Date; y: number }[] = [];
	const cumulatedPnl: { x: Date; y: number }[] = [];
	let cpnl = 0;
	const labels: string[] = [];
	allTrades.forEach((trade) => {
		cpnl += trade.netPnl;
		pnl.push({
			x: trade.boughtTimestamp,
			y: trade.netPnl
		});
		cumulatedPnl.push({
			x: trade.boughtTimestamp,
			y: cpnl
		});

		labels.push(trade.pair);
	});
	return { trades: allTrades, cumulatedPnl, pnl, labels };
}
