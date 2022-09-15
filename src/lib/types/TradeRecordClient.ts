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
	soldAmount: number;
	soldPrice: number;
	pnl: number;
	watcher: {
		type: string;
		config: string;
	};
};
