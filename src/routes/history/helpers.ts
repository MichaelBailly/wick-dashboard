import { FEE_PER_TRADE } from '$lib/constants.client';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { PnlPerType } from '$lib/types/PnlPerType';
import { getVolumeFamily } from '$lib/volumeReference';

export type PnlPerVol = {
	family: string;
	pnl: number;
	tradeCount: number;
	pnlPerTrade: number;
};

export function computePnlPerVolume(trades: DashboardTrade[]) {
	let pnlPerVol: PnlPerVol[] = [];
	const tradesPerVolume: Map<string, DashboardTrade[]> = new Map();

	trades.forEach((trade) => {
		const family = getVolumeFamily(trade.pair);
		if (!family) {
			return;
		}
		let pvtrades = tradesPerVolume.get(family);
		if (!pvtrades) {
			pvtrades = [];
		}
		pvtrades.push(trade);
		tradesPerVolume.set(family, pvtrades);
	});
	pnlPerVol = Array.from(tradesPerVolume.entries()).map(([family, trades]) => {
		const pnl = trades.reduce((acc, trade) => acc + trade.netPnl, 0);
		const pnlPerTrade = pnl / trades.length;
		return { family, pnl, pnlPerTrade, tradeCount: trades.length };
	});
	pnlPerVol.sort((a, b) => b.pnl - a.pnl);

	return pnlPerVol;
}

export function computePnlPerType(pnlPerTypeList: PnlPerType[], showNegativePnL: boolean) {
	let result = pnlPerTypeList.map((pnlPerType) => {
		return {
			...pnlPerType,
			pnl: pnlPerType.pnl - pnlPerType.tradeCount * FEE_PER_TRADE
		};
	});
	result.sort((a, b) => b.pnl - a.pnl);

	if (!showNegativePnL) {
		result = result.filter((pnlPerType) => pnlPerType.pnl > 0);
	}

	return result;
}
