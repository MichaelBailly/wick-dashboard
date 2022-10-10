import type { FamilyId } from '$lib/volumeReference';

export type TradeRecordClient = {
	_id: string;
	id: string;
	amount: number;
	quoteAmount: number;
	price: number;
	buyTimestamp: Date;
	boughtTimestamp: Date;
	sellTimestamp: Date;
	soldTimestamp: Date;
	low: number;
	pair: string;
	volumeFamily: FamilyId;
	soldAmount: number;
	soldPrice: number;
	pnl: number;
	watcher: {
		type: string;
		config: string;
	};
};
