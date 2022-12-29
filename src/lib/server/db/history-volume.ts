import { FEE_BUY, FEE_SELL } from '$lib/tradeUtils';
import type { TradeTimeRangeMongoQuery } from '$lib/types/TradeTimeRangeMongoQuery';
import type { TradeTimeRangeOpts } from '$lib/types/TradeTimeRangeOpts';
import type { Watcher } from '$lib/types/Watcher';
import { getTradeCollection } from '.';

type PnlPerTypePerVolumeFamilyMongoQuery = {
	volumeFamily: {
		$exists: boolean;
	};
} & TradeTimeRangeMongoQuery;

export async function getPnlPerTypePerVolumeFamily(opts: TradeTimeRangeOpts) {
	const query: PnlPerTypePerVolumeFamilyMongoQuery = {
		volumeFamily: { $exists: true }
	};

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
	pipeline.push({ $match: query });
	pipeline.push({
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
			}
		}
	});

	pipeline.push({
		$group: {
			_id: {
				$concat: ['$volumeFamily', ' ', '$watcher.type', ' ', '$watcher.config']
			},
			watcher: { $first: '$watcher' },
			volumeFamily: { $first: '$volumeFamily' },
			tradeCount: { $sum: 1 },
			pnl: { $sum: '$netPnl' }
		}
	});

	const collection = await getTradeCollection();
	const pipelineResponse = await collection.aggregate(pipeline).toArray();

	return pipelineResponse;
}

export async function getGroupsPerType(opts: TradeTimeRangeOpts) {
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
		$group: {
			_id: {
				$concat: ['$watcher.type', ' ', '$watcher.config']
			},
			watcher: { $first: '$watcher' },
			count: { $sum: 1 },
			xs: {
				$sum: {
					$cond: [{ $eq: ['$volumeFamily', 'xs'] }, '$pnl', 0]
				}
			},
			s: {
				$sum: {
					$cond: [{ $eq: ['$volumeFamily', 's'] }, '$pnl', 0]
				}
			},
			m: {
				$sum: {
					$cond: [{ $eq: ['$volumeFamily', 'm'] }, '$pnl', 0]
				}
			},
			l: {
				$sum: {
					$cond: [{ $eq: ['$volumeFamily', 'l'] }, '$pnl', 0]
				}
			},
			xl: {
				$sum: {
					$cond: [{ $eq: ['$volumeFamily', 'xl'] }, '$pnl', 0]
				}
			}
		}
	});

	const collection = await getTradeCollection();
	const trades = await collection.aggregate(pipeline).toArray();

	if (trades.every(isPnlPerFamilyPerType)) {
		return trades;
	}

	throw new Error('Unable to fetch pnlPerType');
}

export type PnlPerFamilyPerType = {
	watcher: Watcher;
	count: number;
	xs: number;
	s: number;
	m: number;
	l: number;
	xl: number;
};

function isPnlPerFamilyPerType(test: unknown): test is PnlPerFamilyPerType {
	return (
		typeof test !== null &&
		typeof test !== undefined &&
		typeof (test as PnlPerFamilyPerType).watcher.type === 'string' &&
		typeof (test as PnlPerFamilyPerType).watcher.config === 'string' &&
		typeof (test as PnlPerFamilyPerType).count === 'number' &&
		typeof (test as PnlPerFamilyPerType).xs === 'number' &&
		typeof (test as PnlPerFamilyPerType).s === 'number' &&
		typeof (test as PnlPerFamilyPerType).m === 'number' &&
		typeof (test as PnlPerFamilyPerType).l === 'number' &&
		typeof (test as PnlPerFamilyPerType).xl === 'number'
	);
}
