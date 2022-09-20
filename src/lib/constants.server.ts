export const MONGO_DB = process.env.MONGO_DB || 'mongodb://127.0.0.1:27017/testwicks';
export const MONGO_TRADE_COLLECTION = process.env.MONGO_TRADE_COLLECTION || 'trades';

export const MONGO_REFERENCES_DB =
	process.env.MONGO_REFERENCES_DB || 'mongodb://127.0.0.1:27017/references';
export const MONGO_VOLUME_COLLECTION = process.env.MONGO_VOLUME_COLLECTION || 'volume';
