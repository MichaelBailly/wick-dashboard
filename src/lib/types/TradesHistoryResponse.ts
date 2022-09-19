import type { TradeRecordClient } from './TradeRecordClient';

export type TradesHistoryResponse = {
	[key: string]: {
		pnl: number;
		trades: TradeRecordClient[];
	};
};
