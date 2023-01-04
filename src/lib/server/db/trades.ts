import { FEE_BUY, FEE_SELL } from '$lib/tradeUtils';
import { isPnlPerType, type PnlPerType } from '$lib/types/PnlPerType';
import type { Watcher } from '$lib/types/Watcher';
import { sub } from 'date-fns';
import type { TradeRecordClient } from 'src/lib/types/TradeRecordClient';
import { getTradeCollection } from '.';
import type { TradeTimeRangeMongoQuery } from '../../types/TradeTimeRangeMongoQuery';
import type { TradeTimeRangeOpts } from '../../types/TradeTimeRangeOpts';

export enum SORT {
	ASC = 1,
	DESC = -1
}

export enum SORT_FIELD {
	BUY = 'buyTimestamp',
	BOUGHT = 'boughtTimestamp',
	SELL = 'sellTimestamp',
	SOLD = 'soldTimestamp'
}

export type TradeHistoryOpts = {
	type?: string;
	config?: string;
} & TradeTimeRangeOpts;

export type GetTradesOpts = {
	type?: string;
	config?: string;
	start?: Date;
	end?: Date;
	sort?: SORT;
	sortField?: SORT_FIELD;
};

export type PnlPerDay = {
	_id: string;
	pnl: number;
	netPnl: number;
	tradeCount: number;
};

type GetTradesMongoQuery = {
	'watcher.type'?: string;
	'watcher.config'?: string;
} & TradeTimeRangeMongoQuery;

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
	const trades = await collection.find(query).toArray();

	const clientTrades = trades.map((t) => ({
		...t,
		_id: t._id.toString()
	}));
	const ok = clientTrades.every(isTradeRecordClient);
	if (ok) {
		return applySort(clientTrades, sort, sortField);
	}

	throw new Error('Unable to fettch trades');
}

function applySort(trades: TradeRecordClient[], sort: SORT, sortField: SORT_FIELD) {
	return trades.sort((a, b) => {
		if (a[sortField] < b[sortField]) {
			return sort;
		}
		if (a[sortField] > b[sortField]) {
			return -sort;
		}
		return 0;
	});
}

function isTradeRecordClient(test: unknown): test is TradeRecordClient {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		(test as TradeRecordClient)._id !== undefined
	);
}

export async function getTradePnl(opts: TradeTimeRangeOpts = {}): Promise<PnlPerType[]> {
	const query: TradeTimeRangeMongoQuery = {};

	if (opts.start && opts.start instanceof Date) {
		query.$and = [{ boughtTimestamp: { $gte: opts.start } }];
	}
	if (opts.end && opts.end instanceof Date) {
		if (!query.$and) {
			query.$and = [];
		}
		query.$and.push({ boughtTimestamp: { $lt: opts.end } });
	}

	const pipeline = [];
	if (query.$and) {
		pipeline.push({ $match: query });
	}

	pipeline.push({
		$set: {
			type: { $concat: ['$watcher.type', ' ', '$watcher.config'] }
		}
	});

	pipeline.push({
		$group: {
			_id: '$type',
			watcher: { $first: '$watcher' },
			pnl: { $sum: '$pnl' },
			tradeCount: { $sum: 1 }
		}
	});

	pipeline.push({ $sort: { pnl: -1 } });

	const collection = await getTradeCollection();
	const trades = await collection.aggregate(pipeline).toArray();

	if (trades.every(isPnlPerType)) {
		return trades;
	}

	throw new Error('Unable to fetch pnlPerType');
}

export async function getPnlPerDay(opts: TradeTimeRangeOpts = {}): Promise<PnlPerDay[]> {
	const query: TradeTimeRangeMongoQuery = {};
	const start = opts.start || sub(new Date(), { months: 3 });
	const end = opts.end || null;

	query.$and = [{ boughtTimestamp: { $gte: start } }];
	if (end && end instanceof Date) {
		query.$and.push({ boughtTimestamp: { $lt: end } });
	}

	const pipeline = [
		{
			$match: query
		},
		{
			$addFields: {
				netPnl: {
					$subtract: [
						{ $subtract: [{ $multiply: ['$soldAmount', '$soldPrice'] }, '$quoteAmount'] },
						{
							$add: [
								{ $multiply: ['$quoteAmount', FEE_BUY] },
								{ $multiply: ['$soldAmount', '$soldPrice', FEE_SELL] }
							]
						}
					]
				},
				boughtMonth: { $dateToString: { format: '%Y-%m-%d', date: '$boughtTimestamp' } }
			}
		},
		{
			$group: {
				_id: '$boughtMonth',
				netPnl: { $sum: '$netPnl' },
				pnl: { $sum: '$pnl' },
				tradeCount: { $sum: 1 }
			}
		},
		{
			$sort: { _id: 1 }
		}
	];

	const collection = await getTradeCollection();
	const trades = await collection.aggregate(pipeline).toArray();

	if (trades.every(isPnlPerDay)) {
		return trades;
	}

	throw new Error('Unable to fetch pnlPerDay');
}

export function isPnlPerDay(test: unknown): test is PnlPerDay {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		(test as PnlPerDay)._id !== undefined &&
		typeof (test as PnlPerDay).pnl === 'number' &&
		typeof (test as PnlPerDay).netPnl === 'number' &&
		typeof (test as PnlPerDay).tradeCount === 'number'
	);
}

export type PnlPerVol = {
	family: string;
	pnl: number;
	tradeCount: number;
	pnlPerTrade: number;
};

export async function getPnlPerVolumeFamily(opts: TradeTimeRangeOpts = {}): Promise<PnlPerVol[]> {
	const query: TradeTimeRangeMongoQuery = {};

	if (opts.start && opts.start instanceof Date) {
		query.$and = [{ boughtTimestamp: { $gte: opts.start } }];
	}
	if (opts.end && opts.end instanceof Date) {
		if (!query.$and) {
			query.$and = [];
		}
		query.$and.push({ boughtTimestamp: { $lt: opts.end } });
	}

	const pipeline = [
		{
			$match: query
		},
		{
			$group: {
				_id: '$volumeFamily',
				pnl: { $sum: '$pnl' },
				tradeCount: { $sum: 1 }
			}
		}
	];

	const collection = await getTradeCollection();
	const trades = await collection.aggregate(pipeline).toArray();
	const pnlPerVol = trades.map((t) => ({
		family: t._id,
		pnl: t.pnl,
		tradeCount: t.tradeCount,
		pnlPerTrade: t.pnl / t.tradeCount
	}));

	if (pnlPerVol.every(isPnlPerVol)) {
		return pnlPerVol;
	}
	throw new Error('Unable to fetch pnlPerDay');
}

function isPnlPerVol(test: unknown): test is PnlPerVol {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		typeof (test as PnlPerVol).family === 'string' &&
		typeof (test as PnlPerVol).pnl === 'number' &&
		typeof (test as PnlPerVol).tradeCount === 'number' &&
		typeof (test as PnlPerVol).pnlPerTrade === 'number'
	);
}

export type GetPnlPerCmcFamilyOpts = {
	perWatcher?: boolean;
} & TradeTimeRangeOpts;

export async function getPnlPerCmcFamily(opts: GetPnlPerCmcFamilyOpts = {}) {
	const perWatcher = opts.perWatcher || false;
	const query: TradeTimeRangeMongoQuery = {};
	if (opts.start && opts.start instanceof Date) {
		query.$and = [{ boughtTimestamp: { $gte: opts.start } }];
	}
	if (opts.end && opts.end instanceof Date) {
		if (!query.$and) {
			query.$and = [];
		}
		query.$and.push({ boughtTimestamp: { $lt: opts.end } });
	}
	const match = { ...query, cmcFamily: { $exists: true } };

	const groupKey = perWatcher
		? ['$cmcFamily', ' ', '$watcher.type', ' ', '$watcher.config']
		: ['$cmcFamily'];

	const pipeline = [
		{
			$match: match
		},
		{
			$group: {
				_id: { $concat: groupKey },
				netPnl: {
					$sum: {
						$subtract: [
							{ $subtract: [{ $multiply: ['$soldAmount', '$soldPrice'] }, '$quoteAmount'] },
							{
								$add: [
									{ $multiply: ['$quoteAmount', FEE_BUY] },
									{ $multiply: ['$soldAmount', '$soldPrice', FEE_SELL] }
								]
							}
						]
					}
				},
				tradeCount: { $sum: 1 },
				cmcFamily: { $first: '$cmcFamily' },
				watcher: { $first: '$watcher' }
			}
		},
		{ $sort: { netPnl: -1, _id: 1 } }
	];
	const collection = await getTradeCollection();
	const pnlPerCmcFamily = await collection.aggregate(pipeline).toArray();
	if (!pnlPerCmcFamily.every(isPnlPerCmcFamily)) {
		throw new Error('Unable to fetch pnlPerCmcFamily');
	}
	return pnlPerCmcFamily;
}

export type PnlPerCmcFamily = {
	netPnl: number;
	tradeCount: number;
	cmcFamily: string;
	watcher: Watcher;
};

export function isPnlPerCmcFamily(test: unknown): test is PnlPerCmcFamily {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		typeof (test as PnlPerCmcFamily).netPnl === 'number' &&
		typeof (test as PnlPerCmcFamily).tradeCount === 'number' &&
		typeof (test as PnlPerCmcFamily).cmcFamily === 'string' &&
		typeof (test as PnlPerCmcFamily).watcher === 'object'
	);
}
