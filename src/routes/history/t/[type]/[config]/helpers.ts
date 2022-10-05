import { FEE_PER_TRADE } from '$lib/constants.client';
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
		const tradePnl = trade.pnl - FEE_PER_TRADE;
		cpnl += tradePnl;
		pnl.push({
			x: trade.boughtTimestamp,
			y: tradePnl
		});
		cumulatedPnl.push({
			x: trade.boughtTimestamp,
			y: cpnl
		});

		labels.push(trade.pair);
	});
	return { trades: allTrades, cumulatedPnl, pnl, labels };
}
