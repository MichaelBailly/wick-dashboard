import type { TradesHistoryResponse } from '$lib/types/TradesHistoryResponse';
import { format } from 'date-fns';
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

type TradeHistoryMongoQuery = {
	'watcher.type'?: string;
	'watcher.config'?: string;
	$and?: { boughtTimestamp: { $gte?: Date; $lt?: Date } }[];
};

export async function getTradesHistory(opts: TradeHistoryOpts = {}) {
	const query: TradeHistoryMongoQuery = {};
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
	const trades = await collection.find(query).sort({ soldTimestamp: -1 }).toArray();

	const clientTrades = trades.map((t) => ({
		...t,
		_id: t._id.toString()
	}));
	if (!clientTrades.every(isTradeRecordClient)) {
		throw new Error('Unable to fettch trades');
	}

	// group by day
	const groupedTrades: TradesHistoryResponse = {};
	clientTrades.forEach((t) => {
		const date = format(t.soldTimestamp, 'yyyy-MM-dd');
		if (!groupedTrades[date]) {
			groupedTrades[date] = {
				pnl: 0,
				trades: []
			};
		}
		groupedTrades[date].trades.push(t);
		groupedTrades[date].pnl += t.pnl;
	});

	return groupedTrades;
}

function isTradeRecordClient(test: unknown): test is TradeRecordClient {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		(test as TradeRecordClient)._id !== undefined
	);
}
