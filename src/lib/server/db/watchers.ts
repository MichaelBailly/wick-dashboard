import { FEE_PER_TRADE } from '$lib/constants.client';
import { getDateAtMidnightUTC } from '$lib/dates';
import type { Watcher } from '$lib/types/Watcher';
import { startOfMonth } from 'date-fns';
import { getTradeCollection } from '.';
import type { TradeTimeRangeOpts } from '../../types/TradeTimeRangeOpts';

export type PnlPerVolumeFamily = {
	watcher: Watcher;
	volumeFamily: string;
	pnl: number;
	tradeCount: number;
	netPnl: number;
};

export type PnlPerCMCFamily = {
	watcher: Watcher;
	cmcFamily: string;
	pnl: number;
	tradeCount: number;
	netPnl: number;
};

export async function getPnlPerVolumeFamily(
	opts: TradeTimeRangeOpts = {}
): Promise<PnlPerVolumeFamily[]> {
	let start: Date;
	let end: Date;
	if (opts.start) {
		start = opts.start;
	} else {
		start = getDateAtMidnightUTC(startOfMonth(new Date()));
	}
	if (opts.end) {
		end = opts.end;
	} else {
		end = new Date();
	}

	const collection = await getTradeCollection();

	const response = await collection
		.aggregate([
			{
				$match: {
					volumeFamily: {
						$ne: 'unknown'
					},
					boughtTimestamp: {
						$gte: start,
						$lt: end
					}
				}
			},
			{
				$group: {
					_id: {
						$concat: ['$volumeFamily', ' ', '$watcher.type', ' ', '$watcher.config']
					},
					pnl: {
						$sum: '$pnl'
					},
					tradeCount: {
						$count: {}
					}
				}
			},
			{
				$match: {
					pnl: {
						$gt: 0
					}
				}
			},
			{
				$addFields: {
					netPnl: {
						$subtract: [
							'$pnl',
							{
								$multiply: ['$tradeCount', FEE_PER_TRADE]
							}
						]
					}
				}
			},
			{
				$match: {
					netPnl: {
						$gt: 0
					}
				}
			}
		])
		.toArray();

	const result = response.map((item) => {
		const [volumeFamily, watcherType, watcherConfig] = item._id.split(' ');
		return {
			watcher: {
				type: watcherType,
				config: watcherConfig
			},
			volumeFamily,
			pnl: item.pnl,
			tradeCount: item.tradeCount,
			netPnl: item.netPnl
		};
	});
	if (!result.every(isPnlPerVolumeFamily)) {
		throw new Error('Invalid response from database');
	}
	return result;
}

function isPnlPerVolumeFamily(arg: unknown): arg is PnlPerVolumeFamily {
	return (
		typeof arg === 'object' &&
		arg !== null &&
		typeof (arg as PnlPerVolumeFamily).watcher === 'object' &&
		(arg as PnlPerVolumeFamily).watcher !== null &&
		typeof (arg as PnlPerVolumeFamily).watcher.type === 'string' &&
		typeof (arg as PnlPerVolumeFamily).watcher.config === 'string' &&
		typeof (arg as PnlPerVolumeFamily).volumeFamily === 'string' &&
		typeof (arg as PnlPerVolumeFamily).pnl === 'number' &&
		typeof (arg as PnlPerVolumeFamily).tradeCount === 'number' &&
		typeof (arg as PnlPerVolumeFamily).netPnl === 'number'
	);
}

export async function getPnlPerCMCFamily(
	opts: TradeTimeRangeOpts = {}
): Promise<PnlPerCMCFamily[]> {
	let start: Date;
	let end: Date;
	if (opts.start) {
		start = opts.start;
	} else {
		start = getDateAtMidnightUTC(startOfMonth(new Date()));
	}
	if (opts.end) {
		end = opts.end;
	} else {
		end = new Date();
	}

	const collection = await getTradeCollection();

	const response = await collection
		.aggregate([
			{
				$match: {
					cmcFamily: {
						$exists: true,
						$ne: 'unknown'
					},
					boughtTimestamp: {
						$gte: start,
						$lt: end
					}
				}
			},
			{
				$group: {
					_id: {
						$concat: ['$cmcFamily', ' ', '$watcher.type', ' ', '$watcher.config']
					},
					pnl: {
						$sum: '$pnl'
					},
					tradeCount: {
						$count: {}
					}
				}
			},
			{
				$match: {
					pnl: {
						$gt: 0
					}
				}
			},
			{
				$addFields: {
					netPnl: {
						$subtract: [
							'$pnl',
							{
								$multiply: ['$tradeCount', FEE_PER_TRADE]
							}
						]
					}
				}
			},
			{
				$match: {
					netPnl: {
						$gt: 0
					}
				}
			}
		])
		.toArray();

	const result = response.map((item) => {
		const [family, watcherType, watcherConfig] = item._id.split(' ');
		return {
			watcher: {
				type: watcherType,
				config: watcherConfig
			},
			cmcFamily: family,
			pnl: item.pnl,
			tradeCount: item.tradeCount,
			netPnl: item.netPnl
		};
	});
	if (!result.every(isPnlPerCMCFamily)) {
		throw new Error('Invalid response from database');
	}
	return result;
}

function isPnlPerCMCFamily(arg: unknown): arg is PnlPerCMCFamily {
	return (
		typeof arg === 'object' &&
		arg !== null &&
		typeof (arg as PnlPerCMCFamily).watcher === 'object' &&
		(arg as PnlPerCMCFamily).watcher !== null &&
		typeof (arg as PnlPerCMCFamily).watcher.type === 'string' &&
		typeof (arg as PnlPerCMCFamily).watcher.config === 'string' &&
		typeof (arg as PnlPerCMCFamily).cmcFamily === 'string' &&
		typeof (arg as PnlPerCMCFamily).pnl === 'number' &&
		typeof (arg as PnlPerCMCFamily).tradeCount === 'number' &&
		typeof (arg as PnlPerCMCFamily).netPnl === 'number'
	);
}
