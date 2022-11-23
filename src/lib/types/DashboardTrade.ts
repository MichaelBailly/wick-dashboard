import type { TradeRecordClient } from './TradeRecordClient';

export type DashboardTrade = {
	netPnl: number;
} & Omit<TradeRecordClient, 'details'>;
