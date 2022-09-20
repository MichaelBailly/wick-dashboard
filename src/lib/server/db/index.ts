import { MongoClient } from 'mongodb';
import {
	MONGO_DB,
	MONGO_REFERENCES_DB,
	MONGO_TRADE_COLLECTION,
	MONGO_VOLUME_COLLECTION
} from '../../constants.server';

let client: MongoClient | null = null;

export async function getClient() {
	return getClientInternal(MONGO_DB);
}

export async function getReferenceClient() {
	return getClientInternal(MONGO_REFERENCES_DB);
}

export async function getTradeCollection() {
	const client = await getClient();
	return client.db().collection(MONGO_TRADE_COLLECTION);
}

export async function getVolumeCollection() {
	const client = await getClient();
	return client.db().collection(MONGO_VOLUME_COLLECTION);
}

async function getClientInternal(db: string) {
	if (!client) {
		client = await new MongoClient(db).connect();
	}
	return client;
}
