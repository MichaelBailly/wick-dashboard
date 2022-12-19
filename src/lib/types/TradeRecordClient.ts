import type { FamilyId } from '$lib/volumeReference';
import type { Watcher } from './Watcher';

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
	watcher: Watcher;
	details: {
		simulation: unknown;
		buyTransaction: unknown;
		sellTransaction: unknown;
	};
};
