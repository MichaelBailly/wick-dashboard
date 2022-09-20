import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
import type { TradesHistoryResponse } from '$lib/types/TradesHistoryResponse';

export type PerTradeTypeResponseInternal = {
	// trade type
	[key: string]: {
		watcher: {
			type: string;
			config: string;
		};
		pnl: number;
		tradeCount: number;
		history: {
			date: string;
			pnl: number;
			trades: TradeRecordClient[];
		}[];
	};
};

export type PerTradeTypeResponse = {
	type: string;
	watcher: {
		type: string;
		config: string;
	};
	pnl: number;
	tradeCount: number;
	history: {
		date: string;
		pnl: number;
		trades: TradeRecordClient[];
	}[];
};

const FEE_PER_TRADE = 0.15;

export function perTradeType(trades: TradesHistoryResponse): PerTradeTypeResponse[] {
	const perTradeType: PerTradeTypeResponseInternal = {};
	for (const date in trades) {
		const tradesForDate = trades[date];
		for (const trade of tradesForDate.trades) {
			const tradeType = `${trade.watcher.type} ${trade.watcher.config}`;
			if (!perTradeType[tradeType]) {
				perTradeType[tradeType] = {
					watcher: trade.watcher,
					pnl: 0,
					tradeCount: 0,
					history: []
				};
			}
			perTradeType[tradeType].pnl += trade.pnl;
			perTradeType[tradeType].tradeCount++;
			let dayData = perTradeType[tradeType].history.find((d) => d.date === date);
			if (!dayData) {
				dayData = {
					date,
					pnl: 0,
					trades: []
				};
				perTradeType[tradeType].history.push(dayData);
			}
			dayData.pnl += trade.pnl;
			dayData.trades.push(trade);
		}
	}

	const result: PerTradeTypeResponse[] = [];

	Object.keys(perTradeType).forEach((key) => {
		result.push({
			type: key,
			watcher: perTradeType[key].watcher,
			pnl: perTradeType[key].pnl - perTradeType[key].tradeCount * FEE_PER_TRADE,
			tradeCount: perTradeType[key].tradeCount,
			history: perTradeType[key].history
		});
	});
	return result;
}
