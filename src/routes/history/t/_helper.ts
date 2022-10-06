import type { DashboardTrade } from '$lib/types/DashboardTrade';
import { format } from 'date-fns';

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
			trades: DashboardTrade[];
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
	pnlPerTrade: number;
	history: {
		date: string;
		pnl: number;
		trades: DashboardTrade[];
	}[];
};

export function perTradeType(trades: DashboardTrade[]): PerTradeTypeResponse[] {
	const perTradeType: PerTradeTypeResponseInternal = {};
	for (const trade of trades) {
		const date = format(trade.boughtTimestamp, 'yyyy-MM-dd');
		const tradeType = `${trade.watcher.type} ${trade.watcher.config}`;
		if (!perTradeType[tradeType]) {
			perTradeType[tradeType] = {
				watcher: trade.watcher,
				pnl: 0,
				tradeCount: 0,
				history: []
			};
		}
		perTradeType[tradeType].pnl += trade.netPnl;
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
		dayData.pnl += trade.netPnl;
		dayData.trades.push(trade);
	}

	const result: PerTradeTypeResponse[] = [];

	Object.keys(perTradeType).forEach((key) => {
		result.push({
			type: key,
			watcher: perTradeType[key].watcher,
			pnl: perTradeType[key].pnl,
			tradeCount: perTradeType[key].tradeCount,
			pnlPerTrade: perTradeType[key].pnl / perTradeType[key].tradeCount,
			history: perTradeType[key].history
		});
	});
	return result;
}
