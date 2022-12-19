import type { FamilyId } from '$lib/volumeReference';
import type { Watcher } from './Watcher';

export type TypeHistorySummary = {
	watcher: Watcher;
	netPnl: number;
	tradeCount: number;
	volumeFamilies: {
		volumeFamily: FamilyId;
		netPnl: number;
		tradeCount: number;
	}[];
};
