import type { FamilyId } from '$lib/volumeReference';

export type TypeHistorySummary = {
	watcher: {
		type: string;
		config: string;
	};
	netPnl: number;
	tradeCount: number;
	volumeFamilies: {
		volumeFamily: FamilyId;
		netPnl: number;
		tradeCount: number;
	}[];
};
