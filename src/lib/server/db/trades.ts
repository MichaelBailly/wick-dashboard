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

export type TradeHistoryOpts = {
	type?: string;
	config?: string;
	start?: Date;
	end?: Date;
};

export type GetTradesOpts = {
	type?: string;
	config?: string;
	start?: Date;
	end?: Date;
	sort?: SORT;
	sortField?: SORT_FIELD;
};

type GetTradesMongoQuery = {
	'watcher.type'?: string;
	'watcher.config'?: string;
	$and?: { boughtTimestamp: { $gte?: Date; $lt?: Date } }[];
};

export async function getTrades(opts: GetTradesOpts = {}): Promise<TradeRecordClient[]> {
	const sort = opts?.sort || SORT.DESC;
	const sortField = opts?.sortField || SORT_FIELD.BOUGHT;
	const query: GetTradesMongoQuery = {};
	if (opts.type && typeof opts.type === 'string') {
		query['watcher.type'] = opts.type;
	}
	if (opts.config && typeof opts.config === 'string') {
		query['watcher.config'] = opts.config;
	}
	if (opts.start && opts.start instanceof Date) {
		query.$and = [{ boughtTimestamp: { $gte: opts.start } }];
	}
	if (opts.end && opts.end instanceof Date) {
		if (!query.$and) {
			query.$and = [];
		}
		query.$and.push({ boughtTimestamp: { $lt: opts.end } });
	}
	const collection = await getTradeCollection();
	const trades = await collection
		.find(query)
		.sort({ [sortField]: sort })
		.toArray();

	const clientTrades = trades.map((t) => ({
		...t,
		_id: t._id.toString()
	}));
	const ok = clientTrades.every(isTradeRecordClient);
	if (ok) {
		return clientTrades;
	}

	throw new Error('Unable to fettch trades');
}

function isTradeRecordClient(test: unknown): test is TradeRecordClient {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		(test as TradeRecordClient)._id !== undefined
	);
}
