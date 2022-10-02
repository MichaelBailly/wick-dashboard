import type { TradeRecordClient } from '$lib/types/TradeRecordClient';

export function getTradesGraphData(trades: TradeRecordClient[]) {
	const allTrades = [...trades];
	// sort allTrades by boughtTimestamp, older first
	allTrades.sort((a, b) => a.boughtTimestamp.getTime() - b.boughtTimestamp.getTime());

	const pnl: { x: Date; y: number }[] = [];
	const cumulatedPnl: { x: Date; y: number }[] = [];
	let cpnl = 0;
	const labels: string[] = [];
	allTrades.forEach((trade) => {
		cpnl += trade.pnl;
		pnl.push({
			x: trade.boughtTimestamp,
			y: trade.pnl
		});
		cumulatedPnl.push({
			x: trade.boughtTimestamp,
			y: cpnl
		});

		labels.push(trade.pair);
	});
	return { trades: allTrades, cumulatedPnl, pnl, labels };
}
