import { FEE_PER_TRADE } from './constants.client';
import type { TradeRecordClient } from './types/TradeRecordClient';

export function getNetPnl(trade: TradeRecordClient) {
	return trade.pnl - FEE_PER_TRADE;
}
