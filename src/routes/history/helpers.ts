import { FEE_PER_TRADE } from '$lib/constants.client';
import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
import { getVolumeFamily } from '$lib/volumeReference';

export type PnlPerVol = {
	family: string;
	pnl: number;
	tradeCount: number;
	pnlPerTrade: number;
};

export function computePnlPerVolume(trades: TradeRecordClient[]) {
	let pnlPerVol: PnlPerVol[] = [];
	const tradesPerVolume: Map<string, TradeRecordClient[]> = new Map();

	trades.forEach((trade) => {
		const family = getVolumeFamily(trade.pair);
		if (!family) {
			return;
		}
		let trades = tradesPerVolume.get(family);
		if (!trades) {
			trades = [];
		}
		trades.push(trade);
		tradesPerVolume.set(family, trades);
	});
	pnlPerVol = Array.from(tradesPerVolume.entries()).map(([family, trades]) => {
		const pnl = trades.reduce((acc, trade) => acc + trade.pnl - FEE_PER_TRADE, 0);
		const pnlPerTrade = pnl / trades.length;
		return { family, pnl, pnlPerTrade, tradeCount: trades.length };
	});
	pnlPerVol.sort((a, b) => b.pnl - a.pnl);

	return pnlPerVol;
}
