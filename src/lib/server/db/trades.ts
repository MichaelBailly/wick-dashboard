import type { TradeRecordClient } from 'src/lib/types/TradeRecordClient';
import { getTradeCollection } from '.';

export enum SORT {
	ASC = 1,
	DESC = -1
}

export enum SORT_FIELD {
	BUY,
	BOUGHT,
	SELL,
	SOLD
}

export async function getTrades(
	sortField: SORT_FIELD = SORT_FIELD.SOLD,
	sort: SORT = SORT.DESC
): Promise<TradeRecordClient[] | null> {
	const collection = await getTradeCollection();
	const trades = await collection
		.find()
		.sort({ [sortField]: sort })
		.toArray();

	const clientTrades = trades.map((t: any) => ({
		...t,
		_id: t._id.toString()
	}));
	const ok = clientTrades.every(isTradeRecordClient);
	if (ok) {
		return clientTrades;
	}

	throw new Error('Unable to fettch trades');
}

function isTradeRecordClient(test: any): test is TradeRecordClient {
	return test._id !== undefined;
}
