import type { TradeRecordClient } from './types/TradeRecordClient';

export const FEE_SELL = 0.00075;
export const FEE_BUY = 0.00075;

export function getNetPnl(trade: TradeRecordClient) {
	return (
		trade.soldAmount * trade.soldPrice -
		trade.quoteAmount -
		trade.soldAmount * trade.soldPrice * FEE_SELL -
		trade.quoteAmount * FEE_BUY
	);
}
