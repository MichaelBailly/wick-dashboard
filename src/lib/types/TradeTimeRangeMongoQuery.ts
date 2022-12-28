export type TradeTimeRangeMongoQuery = {
	$and?: { boughtTimestamp: { $gte?: Date; $lt?: Date } }[];
};
